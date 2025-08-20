import { Inngest } from "inngest";
import  User  from "../models/user.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id,  first_name, last_name, email_addresses, image_url } = event.data
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url
    };
    await User.create(userData);
  },
);

// Inngest function to delete a user from the database
const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-from-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id);
    }
);

//inngest function to update a user in the database
const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image: image_url
        };
        await User.findByIdAndUpdate(id, userData);
    }
);

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {id: 'release-seats-delete-booking'},
  {event: "app/checkpayment"},
  async({event, step})=>{
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);
    await step.run('check-payment-status', async()=>{
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId)

      //If payment is  not payed release set and del bookings

      if(!booking.isPaid){
        const show = await Show.findById(booking.show)
        booking.bookedSeats.forEach((seat)=>{
          delete show.occupiedSeats[seat]
        });
        show.markModified('occupiedSeats')
        await show.save()
        await Booking.findByIdAndDelete(booking._id)
      }
    })
  }
)

// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  {id: "send-booking-confirmation-email"},
  {event: "app/show.booked"},
    async ({ event, step })=>{
    const { bookingId} = event.data;
    const booking = await Booking.findById(bookingId).populate({
    path: 'show',
    populate: {path: "movie", model: "Movie"}
    }).populate('user');

  await sendEmail({
    to: booking.user.email,
    subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
    body: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #FF3B2E; text-align: center;">🎉 Payment Successful!</h2>
          <p style="font-size: 16px; color: #333; text-align: center;">
            Hi <strong>${booking.user.name}</strong>,  
            your payment has been successfully processed, and your booking is confirmed!
          </p>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #333;">🎬 Booking Details:</h3>
            <ul style="font-size: 15px; color: #555; line-height: 1.6;">
              <li><strong>Movie:</strong> ${booking.show.movie.title}</li>
              <li><strong>Show Time:</strong> ${new Date(booking.show.showDateTime).toLocaleString('en-US', {
                timeZone: 'Asia/Islamabad',
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </li>
              <li><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</li>
              <li><strong>Total Paid:</strong> USD. ${booking.amount}</li>
            </ul>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;"/>

          <p style="font-size: 14px; color: #777; text-align: center;">
            Thank you for choosing <strong>CinemaSnap</strong>!  
            We look forward to seeing you soon. 🍿
          </p>
        </div>
      </div>
    `
  });

  }
)

// Create an array where we'll export future Inngest functions
export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail
                    
];
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
                timeZone: 'Asia/Karachi',
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

const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminder" },
  { cron: "0 */8 * * *" }, // Runs every 8 hours
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
    const windowStart = now;

    // Prepare reminder tasks
    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showTime: { $gte: windowStart, $lte: in8Hours },
      }).populate("movie");

      const tasks = [];

      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;

        // Get unique user IDs
        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (userIds.length === 0) continue;

        const users = await User.find({ _id: { $in: userIds } }).select("name email");

        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showTime,
          });
        }
      }
      return tasks;
    });

    if (reminderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send." };
    }

    // Send reminder emails
    const result = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map((task) =>
          sendEmail({
            to: task.userEmail,
            subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
            body: `
              Hi ${task.userName},<br/><br/>
              This is a friendly reminder that your movie <b>${task.movieTitle}</b> is scheduled to start soon.<br/><br/>
              🎬 <b>Movie:</b> ${task.movieTitle} <br/>
              ⏰ <b>Show Time:</b> ${new Date(task.showTime).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} <br/><br/>
              Movie is about to start after 8 hour make sure you are ready!
              Please arrive at the cinema at least <b>15 minutes</b> before the showtime.<br/><br/>
              Enjoy your movie! 🍿
            `,
          })
        )
      );
    });

    // Calculate success & failure counts
    const sent = result.filter((r) => r.status === "fulfilled").length;
    const failed = result.filter((r) => r.status === "rejected").length;

    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed.`,
    };
  }
);


// Inngest Function to send notifications when a new show is added
const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notifications" },
  { event: "app/show.added" },
  async ({ event }) => {
    const { movieTitle } = event.data;

    // Fetch all users
    const users = await User.find({})
      

    // Loop through users and send emails
    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name || "Movie Fan";

      const subject = `🎬 New Show Added: ${movieTitle}`;
      const body = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CinemaSnap - New Show Added</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,0.1);overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color:#FF3B2E;padding:20px;text-align:center;color:#fff;font-size:24px;font-weight:bold;">
                    🎬 CinemaSnap
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:30px 25px;color:#333333;font-size:16px;line-height:1.6;">
                    <p style="margin:0 0 15px 0;">Hi <strong>${userName}</strong>,</p>
                    <p style="margin:0 0 15px 0;">Great news! A brand-new movie has just been added to our collection:</p>
                    
                    <div style="background-color:#f9f9f9;border:1px solid #e5e5e5;padding:15px;border-radius:8px;margin:20px 0;">
                      <p style="margin:0;font-size:18px;font-weight:bold;color:#FF3B2E;">🎥 ${movieTitle}</p>
                    </div>
                    
                    <p style="margin:0 0 20px 0;">Book your tickets now before they sell out!</p>
                    <p style="margin:0;">🍿 <strong>The CinemaSnap Team</strong></p>
                  </td>
                </tr>

                <!-- Call to Action Button -->
                <tr>
                  <td align="center" style="padding:20px;">
                    <a href="https://cinemasnap.com" 
                      style="background-color:#FF3B2E;color:#ffffff;text-decoration:none;
                              padding:12px 30px;border-radius:6px;font-size:16px;font-weight:bold;
                              display:inline-block;">
                      🎟️ Book Tickets Now
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f4f4f4;padding:15px;text-align:center;font-size:12px;color:#888;">
                    © ${new Date().getFullYear()} CinemaSnap. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;
       await sendEmail({
        to:userEmail,
        subject,
        body,
       })
    }

    return { message :'Notifications sent'};
  }
);

// Create an array where we'll export future Inngest functions
export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail,
    sendShowReminders,
    sendNewShowNotifications,
];
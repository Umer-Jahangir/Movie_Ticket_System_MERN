export const dateFormat = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    });
}
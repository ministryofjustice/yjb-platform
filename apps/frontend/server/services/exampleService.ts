export default class ExampleService {
  // just a test function returning current time
  getCurrentTime(): String {
    const now = new Date();

    const time = now.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const date = now.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return `${time} on ${date}`;
  }
}

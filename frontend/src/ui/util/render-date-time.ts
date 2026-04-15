export const renderTimestamp = (date: Date) => `${renderDate(date)} - ${renderTime(date)}`;

export const renderDate = (date: Date) => `${normTo2(date.getDate())}/${normTo2(date.getMonth() + 1)}/${normTo2(date.getFullYear() - 2000)}`;

const renderTime = (date: Date) => `${normTo2(date.getHours())}:${normTo2(date.getMinutes())}:${normTo2(date.getSeconds())}`;

const normTo2 = (value: number) => value.toString().padStart(2, '0');

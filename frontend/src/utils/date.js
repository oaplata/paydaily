export const formatedDate = (_date) => {
  if (!_date) return '--';

  const date = new Date(_date.seconds * 1000 + _date.nanoseconds / 1000000);

  // Obtén el día, mes y año
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son de 0 a 11
  const year = date.getFullYear();

  // Forma la fecha en formato dd/mm/yyyy
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};

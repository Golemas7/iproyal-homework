export const roundNumber = (number: number, decimals = 12) => {
  var newnumber = new Number(number + '').toFixed(decimals)
  return parseFloat(newnumber)
}

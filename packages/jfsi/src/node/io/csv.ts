import csv from 'csvtojson';

/**
 * Load the list of claims from a CSV result file.
 * @param path The path to the CSV file
 */
export async function loadDataFromCSV<TFormat extends any>(path: string) {
  return (await csv().fromFile(path)) as TFormat[];
}

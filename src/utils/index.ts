export function chooseCoords(rowNum: number, colNum: number, num: number): [number, number][] {

  return chooseNumbers(rowNum * colNum - 1, num).map(i => [Math.floor(i / rowNum), i % colNum]);
}

export function chooseNumbers(max: number, num: number) {
  const result: number[] = new Array(num);
  const map: number[] = new Array(max + 1).fill(-1);
  for (let i = 0; i < num; i++) {
    let randomNum = Math.floor(Math.random() * (max + 1 - i));
    if (map[randomNum] > -1) {
      randomNum = map[randomNum];
    }
    result[i] = randomNum;
    map[randomNum] = max - i;
  }
  return result;
}
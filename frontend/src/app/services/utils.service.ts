import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  withGrid(n: number): number {
    return n * 16;
  }

  xOffSet(): number {
    return 14.5 * 16;
  }

  yOffSet(): number {
    return 8.5 * 16;
  }
}

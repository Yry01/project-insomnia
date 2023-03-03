import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  withGrid(n: number): number {
    return n * 32;
  }
}

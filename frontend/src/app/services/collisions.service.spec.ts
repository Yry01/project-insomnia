import { TestBed } from '@angular/core/testing';

import { CollisionsService } from './collisions.service';

describe('CollisionsService', () => {
  let service: CollisionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollisionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

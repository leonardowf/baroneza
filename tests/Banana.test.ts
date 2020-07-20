import { from } from 'rxjs';

describe('simple suite', () => {
  it('simple scenario', (done) => {
    from('simple stream').subscribe({
      next: () => {
        // Just a simple template to test streams
      },
      complete: done
    });
  });
});

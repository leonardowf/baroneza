import { TestScheduler } from 'rxjs/testing';
import { Observable, from } from 'rxjs';

describe("simple suite", () => {
    it("simple scenario", done => {
        from("simple stream").subscribe({
            next: (x) => {
                // Just a simple template to test streams
                
            },
            complete: done
        })
    })
})
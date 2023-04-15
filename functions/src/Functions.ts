export interface Monoid<A> {
    op(x: A, y: A): A
    empty(): A
}

abstract class MonoidBase<A> implements Monoid<A> {
    protected _empty: A
    protected abstract _op(x: A, y: A): A

    op(x:A, y: A): A {
        if (this._op(x, this._empty) != x) throw new Error("This is not a monoid")
        return this._op(x, y)
    }

    empty(): A {
        return this._empty
    }
}

export class MonoidNumber extends MonoidBase<number> {
    protected _empty: number = 0

    protected _op(x: number, y: number): number {
        return x + y
    }

}
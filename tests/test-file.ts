enum Fred  { One, Two, Three};

type Py = "ONE" | "TWO" | "THREE";

class Foo {
    constructor() { }
    public getStuff(): IStuff[] {
        return [];
    }
    public getFred(): Fred { return Fred.One};
    public getPy(): Py { return "ONE"};
    
};

class IStuff {
    constructor() {
    }
    public field: Fred;
}

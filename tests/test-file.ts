enum Fred  { One, Two, Three};

class Foo {
    constructor() { }
    public getStuff(): IStuff[] {
        return [];
    }
    public getFred(): Fred { return Fred.One};
};

class IStuff {
    constructor() {
    }
    public field: Fred;
}

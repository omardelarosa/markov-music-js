class MarkovChain {
    constructor(obj = {}, states = [], initialState = 0) {
        this.graph = { ...obj };
        this.states = [...states];
        this.currentState = initialState;
    }

    /**
     *
     * Checks current state value without changing it.
     *
     */
    peek() {
        return this.states[this.currentState];
    }

    /**
     *
     * Checks the id of the current state
     *
     */
    peekID() {
        return this.currentState;
    }

    /**
     *
     * Sets next state
     *
     */

    set() {
        const newState = this.sample(this.graph[this.currentState]);
        this.currentState = newState;
    }

    /**
     *
     * Sets and returns next state in chain
     *
     */
    next() {
        this.set();
        return this.states[this.currentState];
    }
    /**
     *
     * Sets and returns ID of next state in chain
     *
     */
    nextID() {
        this.set();
        return this.currentState;
    }

    /**
     *
     * Gets random element from a list
     *
     */
    sample(list) {
        return list[Math.floor(list.length * Math.random())];
    }
}

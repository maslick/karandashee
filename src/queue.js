export default class MyFixedQueue {
    // Create a constructor for the fixed-length queue. This is
    // really more of a FACTORY than a construtor since an
    // entirely tangential object is returned.
    constructor(size, initialValues) {
        // If there are no initial arguments, default it to
        // an empty value so we can call the constructor in
        // a uniform way.
        initialValues = (initialValues || []);
        // Create the fixed queue array value.
        let queue = Array.apply(null, initialValues);
        // Store the fixed size in the queue.
        queue.fixedSize = size;
        // Add the class methods to the queue. Some of these have
        // to override the native Array methods in order to make
        // sure the queue length is maintained.
        queue.push = this.push;
        queue.splice = this.splice;
        queue.unshift = this.unshift;
        queue.history = Array.apply(null, initialValues);
        // Trim any initial excess from the queue.
        this.trimTail.call(queue);
        // Return the new queue.
        return (queue);
    }

    // I trim the queue down to the appropriate size, removing
    // items from the beginning of the internal array.
    trimHead = function () {
        // Check to see if any trimming needs to be performed.
        if (this.length <= this.fixedSize) return;
        // Trim whatever is beyond the fixed size.
        Array.prototype.splice.call(
            this,
            0,
            (this.length - this.fixedSize)
        );
    };

    // I trim the queue down to the appropriate size, removing
    // items from the end of the internal array.
    trimTail = function () {
        // Check to see if any trimming needs to be performed.
        if (this.length <= this.fixedSize) return;
        // Trim whatever is beyond the fixed size.
        Array.prototype.splice.call(
            this,
            this.fixedSize,
            (this.length - this.fixedSize)
        );
    };

    wrapMethod = function (methodName, trimMethod) {
        let wrapper = function () {
            // Get the native Array method.
            let method = Array.prototype[methodName];
            // Call the native method first.
            let result = method.apply(this, arguments);
            // Trim the queue now that it's been augmented.
            trimMethod.call(this);
            // Add item to history
            if ("push".localeCompare(method)) {
                this.history.push(arguments[0]);
            }
            // Return the original value.
            return (result);
        };
        // Return the wrapper method.
        return (wrapper);
    };

    // Wrap the native methods.
    push = this.wrapMethod("push", this.trimHead);
    splice = this.wrapMethod("splice", this.trimTail);
    unshift = this.wrapMethod("unshift", this.trimTail);
}
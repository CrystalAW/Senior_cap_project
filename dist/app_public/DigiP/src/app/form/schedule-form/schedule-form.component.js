var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Component, EventEmitter, Output } from '@angular/core';
import { Validators } from '@angular/forms';
let ScheduleFormComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-schedule-form',
            templateUrl: './schedule-form.component.html',
            styleUrls: ['./schedule-form.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _submitForm_decorators;
    let _submitForm_initializers = [];
    let _submitForm_extraInitializers = [];
    var ScheduleFormComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _submitForm_decorators = [Output()];
            __esDecorate(null, null, _submitForm_decorators, { kind: "field", name: "submitForm", static: false, private: false, access: { has: obj => "submitForm" in obj, get: obj => obj.submitForm, set: (obj, value) => { obj.submitForm = value; } }, metadata: _metadata }, _submitForm_initializers, _submitForm_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ScheduleFormComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        fb;
        schedule;
        tasks;
        scheduleForm;
        submitForm = __runInitializers(this, _submitForm_initializers, new EventEmitter());
        constructor(fb, schedule, tasks) {
            this.fb = fb;
            this.schedule = schedule;
            this.tasks = tasks;
        }
        events = (__runInitializers(this, _submitForm_extraInitializers), []);
        tasklist = [];
        ngOnInit() {
            this.scheduleForm = this.fb.group({
                entries: this.fb.array([this.createEntry()])
            });
        }
        get entries() {
            return this.scheduleForm.get('entries');
        }
        //pull events and tasks from each component and then assign each task a value and then attach the b
        //breakdown question to it.
        //  listEntries() {
        // }
        createEntry() {
            return this.fb.group({
                title: ['', Validators.required],
                description: [''],
                due: [''],
                start: [''],
                end: [''],
                notes: [''],
                hours: []
            });
        }
        addEntry() {
            this.entries.push(this.createEntry());
        }
        removeEntry(index) {
            this.entries.removeAt(index);
        }
        onSubmit() {
            const formData = this.scheduleForm.value.entries;
            const tasks = formData.map((entry) => ({
                title: entry.title,
                notes: entry.notes,
                due: entry.due ? new Date(entry.due).toISOString() : undefined,
                status: 'needsAction'
            }));
            const events = formData.map((entry) => ({
                summary: entry.title,
                description: entry.description,
                start: {
                    dateTime: entry.start ? new Date(entry.start).toISOString() : null,
                    timeZone: 'UTC'
                },
                end: {
                    dateTime: entry.end ? new Date(entry.end).toISOString() : null,
                    timeZone: 'UTC'
                }
            }));
            console.log('Submitting all:', { tasks, events });
            this.submitForm.emit(formData);
        }
    };
    return ScheduleFormComponent = _classThis;
})();
export { ScheduleFormComponent };

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
import { Component } from '@angular/core';
let TasklistComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-tasklist',
            templateUrl: './tasklist.component.html',
            styleUrls: ['./tasklist.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TasklistComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TasklistComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        calendarService;
        scheduleService;
        todo = [];
        pickedTasks = [];
        bdNumbers = {};
        additionalNotes = '';
        endTime = '';
        savedEndTime = '';
        totalTasks = [];
        //  taskBDTupleList: TaskBDTuple [] = this.pickedTasks.map(task => {
        //   return [
        //     {  id: task.id,
        //       title: task.title,
        //       notes: task.notes ?? '',
        //       due: task.due,
        //       status: task.status,
        //       completed: task.completed,
        //       updated: task.updated,
        //       selfLink: task.selfLink,
        //       parent: task.parent,
        //       position: task.position
        //     },
        //     this.bdNumbers[task.id]
        //   ]
        // });
        constructor(calendarService, scheduleService) {
            this.calendarService = calendarService;
            this.scheduleService = scheduleService;
        }
        ngOnInit() {
            this.refresh();
        }
        refresh() {
            this.calendarService.getTaskfromLists('primary').subscribe((tasks) => {
                this.todo = tasks.filter(task => task.status === 'needsAction');
            });
        }
        selectTask(event) {
            const selectElement = event.target;
            const selectedIds = Array.from(selectElement.selectedOptions).map(option => option.value);
            this.pickedTasks = this.todo.filter(task => selectedIds.includes(task.id));
            // Rebuild bdNumbers for picked tasks
            this.bdNumbers = {};
            this.pickedTasks.forEach(task => {
                if (!this.bdNumbers[task.id]) {
                    this.bdNumbers[task.id] = 0; // default  number
                }
            });
        }
        addTask(taskId) {
            const selectedTask = this.todo.find(task => task.id === taskId);
            if (selectedTask && !this.pickedTasks.find(t => t.id === taskId)) {
                this.pickedTasks.push(selectedTask);
                this.totalTasks.push(selectedTask);
                this.bdNumbers[taskId] = 0;
            }
        }
        removeTask(taskId) {
            this.pickedTasks = this.pickedTasks.filter(task => task.id !== taskId);
            delete this.bdNumbers[taskId];
        }
        generate() {
            const taskBDTupleList = this.pickedTasks.map(task => {
                return [
                    { id: task.id,
                        title: task.title,
                        notes: task.notes ?? '',
                        due: task.due,
                        status: task.status,
                        completed: task.completed,
                        updated: task.updated,
                        selfLink: task.selfLink,
                        parent: task.parent,
                        position: task.position
                    },
                    this.bdNumbers[task.id]
                ];
            });
            console.log('Data to be sent to backend:', {
                pickedTasks: this.pickedTasks,
                bdNumbers: this.bdNumbers,
                taskBDTupleList,
                additionalNotes: this.additionalNotes
            });
            this.scheduleService.getCredentials().subscribe(creds => {
                const payload = {
                    creds,
                    taskBDTupleList,
                    additionalNotes: this.additionalNotes,
                    endTime: new Date(this.endTime).toISOString(),
                    tz: 'America/New_York'
                };
                this.scheduleService.generateSchedule(payload).subscribe({
                    next: (res) => {
                        console.log('Schedule created:', res);
                    },
                    error: (err) => {
                        console.error('Schedule creation error:', err);
                    },
                    complete: () => {
                        console.log('Request complete');
                    }
                });
            });
            this.refresh();
        }
        reset() {
            this.scheduleService.getCredentials().subscribe(creds => {
                let endTimeISO;
                if (this.savedEndTime) {
                    const parsedDate = new Date(this.savedEndTime);
                    if (!isNaN(parsedDate.getTime())) {
                        endTimeISO = parsedDate.toISOString();
                    }
                    else {
                        console.warn('Invalid savedEndTime, using now instead');
                        endTimeISO = new Date().toISOString();
                    }
                }
                else {
                    console.warn('No savedEndTime, using now instead');
                    endTimeISO = new Date().toISOString();
                }
                const payload = {
                    creds,
                    endTime: endTimeISO,
                };
                console.log("payload", payload);
                this.scheduleService.regenerateSchedule(payload).subscribe({
                    next: (res) => {
                        console.log('Schedule created:', res);
                    },
                    error: (err) => {
                        console.error('Schedule creation error:', err);
                    },
                    complete: () => {
                        console.log('Request complete');
                    }
                });
            });
            this.refresh();
        }
    };
    return TasklistComponent = _classThis;
})();
export { TasklistComponent };

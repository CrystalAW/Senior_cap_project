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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
let ScheduleComponent = (() => {
    let _classDecorators = [Component({
            selector: 'app-schedule',
            templateUrl: './schedule.component.html',
            styleUrls: ['./schedule.component.css']
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ScheduleComponent = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ScheduleComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        calService;
        scheduleService;
        events = [];
        tasks = [];
        combined = [];
        filteredEvents = [];
        viewMode = 'table';
        timeFilter = 'all';
        selectedDate = new Date(); // You can bind this to a datepicker later
        constructor(calService, scheduleService) {
            this.calService = calService;
            this.scheduleService = scheduleService;
        }
        ngOnInit() {
            this.calService.getTaskfromLists('primary').subscribe(tasks => {
                this.tasks = tasks.map(task => ({ ...task, type: 'task' }));
                this.checkArrays();
            });
            this.calService.getEvents().subscribe(events => {
                this.events = events
                    .map((event) => ({ ...event, type: 'event' }))
                    .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());
                this.checkArrays();
            });
        }
        checkArrays() {
            this.updateCombArray();
            this.filterEvents();
            console.log("combined array:", this.filteredEvents);
        }
        updateCombArray() {
            this.combined = [...this.events, ...this.tasks];
            //Sorting events vs task
            this.combined.sort((a, b) => {
                const aDate = a.type === 'event' ? new Date(a.start.dateTime) : new Date(a.due);
                const bDate = b.type === 'event' ? new Date(b.start.dateTime) : new Date(b.due);
                return aDate.getTime() - bDate.getTime();
            });
        }
        filterEvents() {
            const selected = new Date(this.selectedDate);
            selected.setHours(0, 0, 0, 0);
            this.filteredEvents = this.combined.filter(item => {
                let itemDate;
                if (item.type === 'event') {
                    itemDate = new Date(item.start.dateTime);
                }
                else if (item.type === 'task') {
                    if (!item.due)
                        return false;
                    itemDate = new Date(item.due);
                }
                else {
                    return false;
                }
                if (this.timeFilter === 'day') {
                    const nextDay = new Date(selected);
                    nextDay.setDate(nextDay.getDate() + 1);
                    return itemDate >= selected && itemDate < nextDay;
                }
                if (this.timeFilter === 'week') {
                    const startOfWeek = new Date(selected);
                    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 7);
                    return itemDate >= startOfWeek && itemDate < endOfWeek;
                }
                if (this.timeFilter === 'month') {
                    return (itemDate.getFullYear() === selected.getFullYear() &&
                        itemDate.getMonth() === selected.getMonth());
                }
                return true;
            });
            // extra sorrting just incase
            this.filteredEvents.sort((a, b) => {
                const aDate = a.type === 'event' ? new Date(a.start.dateTime) : new Date(a.due);
                const bDate = b.type === 'event' ? new Date(b.start.dateTime) : new Date(b.due);
                return aDate.getTime() - bDate.getTime();
            });
        }
        onDateChange(event) {
            const input = event.target;
            this.selectedDate = new Date(input.value);
            this.filterEvents();
        }
        toggleView(mode) {
            this.viewMode = mode;
        }
        formatEventDate(start, end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const dateStr = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear().toString().slice(-2)}`;
            const formatTime = (date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            return `${dateStr} ${formatTime(startDate)} - ${formatTime(endDate)}`;
        }
        formatTaskDate(due) {
            const date = new Date(due);
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
        }
        exportCSV() {
            const headers = ['Title', 'Date & Time', 'Description/Status'];
            const rows = this.filteredEvents.map(item => {
                const title = item.type === 'event' ? item.summary : item.title;
                const dateTime = item.type === 'event'
                    ? this.formatEventDate(item.start.dateTime, item.end.dateTime)
                    : this.formatTaskDate(item.due);
                const descriptionOrStatus = item.type === 'event'
                    ? (item.description || '')
                    : (item.status === 'needsAction' ? 'Not Started' : (item.status || ''));
                return [title, dateTime, descriptionOrStatus];
            });
            const csvContent = [headers, ...rows]
                .map(e => e.map(v => `"${v}"`).join(','))
                .join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'schedule.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        exportToPDF() {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Schedule Export', 14, 15);
            const tableData = this.filteredEvents.map(item => {
                const title = item.type === 'event' ? item.summary : item.title;
                const dateTime = item.type === 'event'
                    ? this.formatEventDate(item.start.dateTime, item.end.dateTime)
                    : this.formatTaskDate(item.due);
                const descriptionOrStatus = item.type === 'event'
                    ? (item.description || '')
                    : (item.status === 'needsAction' ? 'Not Started' : (item.status || ''));
                return [title, dateTime, descriptionOrStatus];
            });
            autoTable(doc, {
                head: [['Title', 'Date', 'Description/Status']],
                body: tableData,
                startY: 25,
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [240, 173, 78] }
            });
            doc.save('schedule.pdf');
        }
    };
    return ScheduleComponent = _classThis;
})();
export { ScheduleComponent };

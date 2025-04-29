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
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
let AuthService = (() => {
    let _classDecorators = [Injectable({
            providedIn: 'root'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        http;
        URL = "http://localhost:3000/api/auth/";
        TOKEN_KEY = "token";
        USER_KEY = "user"; // Key for storing user info in localStorage
        userSubject = new BehaviorSubject(null);
        userListener = this.userSubject.asObservable();
        constructor(http) {
            this.http = http;
        }
        googleLogin() {
            window.location.href = 'http://localhost:3000/api/auth/google';
        }
        // Logout the user and remove session data
        logout() {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY); // Remove user data
            this.userSubject.next(null); // Notify that the user has logged out
            window.location.href = '/login';
        }
        // Check if the user is logged in (by checking token and user)
        isLoggedIn() {
            return this.userSubject.value !== null;
        }
        // Get user from localStorage or from service
        getUser() {
            if (!this.userSubject.value) {
                const user = localStorage.getItem(this.USER_KEY);
                return user ? JSON.parse(user) : null; // Return user from localStorage if available
            }
            return this.userSubject.value;
        }
        // Set the user data in both BehaviorSubject and localStorage
        setUser(user, token) {
            console.log('Setting user:', user);
            console.log('Setting token:', token);
            this.userSubject.next(user); // Set user in service state
            localStorage.setItem(this.TOKEN_KEY, token); // Store token in localStorage
            localStorage.setItem(this.USER_KEY, JSON.stringify(user)); // Store user info in localStorage
        }
        checkLoggedInUser() {
            const token = localStorage.getItem(this.TOKEN_KEY);
            //error checking
            if (!token) {
                console.log('No token yet, skip checking for user.');
                return;
            }
            if (token) {
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
                this.http.get(`${this.URL}me`, { headers })
                    .subscribe(response => {
                    if (response.user) {
                        this.setUser(response.user, token);
                    }
                }, error => {
                    console.error('Failed to fetch user', error);
                });
            }
        }
    };
    return AuthService = _classThis;
})();
export { AuthService };

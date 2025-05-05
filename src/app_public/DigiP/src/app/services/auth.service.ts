import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import User from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private URL = "http://localhost:3000/api/auth/";
    private TOKEN_KEY = "token";
    private USER_KEY = "user"; // Key for storing user info in localStorage
    
    private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public userListener: Observable<User | null> = this.userSubject.asObservable();
  
    constructor(private http: HttpClient) { }
  
    googleLogin(): void {
      window.location.href = 'http://localhost:3000/api/auth/google';
    }
      
    // Logout the user and remove session data
    logout(): void {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);  // Remove user data
      this.userSubject.next(null);  // Notify that the user has logged out
      window.location.href = '/login';
    }
  
    // Check if the user is logged in (by checking token and user)
    isLoggedIn(): boolean {
      return this.userSubject.value !== null;
    }
  
    // Get user from localStorage or from service
    getUser(): User | null {
      if (!this.userSubject.value) {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;  // Return user from localStorage if available
      }
      return this.userSubject.value;
    }
  
    // Set the user data in both BehaviorSubject and localStorage
    setUser(user: User, token: string): void {
      console.log('Setting user:', user);
      console.log('Setting token:', token);
      this.userSubject.next(user);  // Set user in service state
      localStorage.setItem(this.TOKEN_KEY, token);  // Store token in localStorage
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));  // Store user info in localStorage
    }
  
    /**
     * Checks tokens from url to see if its already stored
     * @returns 
     */
    checkLoggedInUser(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        //error checking
        if (!token) {
            console.log('No token yet, skip checking for user.');
            return;
        }

        if (token) {
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          this.http.get<{user: User}>(`${this.URL}me`, { headers })
            .subscribe(response => {
              if (response.user) {
                this.setUser(response.user, token);
              }
            }, error => {
              if (error.status === 401) {
                // Handle expired token (token is no longer valid)
                console.error('Token expired. Redirecting to login.');
                this.logout();  // Logout the user
                window.location.href = '/login';  // Redirect to login page
            } else {
                console.error('Failed to fetch user', error);
            }
            });
        }
      }
      
}

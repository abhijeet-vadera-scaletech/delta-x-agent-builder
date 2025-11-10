import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG } from "../shared/constants";
import { ResponseObj, User } from "../types";
import { encryptData, decryptData } from "../utils/encryption";

interface TokenResponse {
  access: string;
  refresh: string;
}

const ignoreSnakeCase = ["preference"];

class HttpService {
  private axiosInstance: AxiosInstance;
  private static instance: HttpService;
  private cancelToken: (() => void) | null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
    this.cancelToken = null;
  }

  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          config.headers["x-request-language"] =
            localStorage.getItem("lang") || "en";
        }

        // Don't set Content-Type for FormData
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request has already been retried, reject
        if (
          error.response?.status !== 401 ||
          originalRequest._retry ||
          originalRequest.url.includes("login") ||
          originalRequest.url.includes("register")
        ) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          // If token refresh is in progress, queue the request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return this.axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // originalRequest._retry = true;
        // this.isRefreshing = true;

        // try {
        //   const newTokens = await this.refreshToken();
        //   this.setTokens(newTokens);
        //   this.processQueue();
        //   return this.axiosInstance(originalRequest);
        // } catch (refreshError) {
        //   this.processQueue(null);
        //   this.clearTokens();
        //   window.location.href = "/auth";
        //   return Promise.reject(refreshError);
        // } finally {
        //   this.isRefreshing = false;
        // }
      }
    );
  }

  //   private async refreshToken(): Promise<TokenResponse> {
  //     const refreshToken = this.getRefreshToken();
  //     if (!refreshToken) {
  //       throw new Error("No refresh token available");
  //     }

  //     try {
  //       const response = await axios.post<ResponseObj<TokenResponse>>(
  //         `${API_CONFIG.baseUrl}/${API_CONFIG.path.refreshToken}/`,
  //         { refresh: refreshToken }
  //       );

  //       if (response.data.is_error) {
  //         throw new Error(response.data.message || "Failed to refresh token");
  //       }

  //       return { ...response.data.data, refresh: refreshToken };
  //     } catch (error: unknown) {
  //       if (error instanceof Error) {
  //         throw new Error(`Failed to refresh token: ${error.message}`);
  //       }
  //       throw new Error("Failed to refresh token");
  //     }
  //   }

  // private processQueue(error: Error | null = null): void {
  //   this.failedQueue.forEach((prom) => {
  //     if (error) {
  //       prom.reject(error);
  //     } else {
  //       prom.resolve(null);
  //     }
  //   });
  //   this.failedQueue = [];
  // }

  public getAccessToken(): string | null {
    const encryptedToken = localStorage.getItem("access_token");
    return encryptedToken ? decryptData<string>(encryptedToken) : null;
  }

  public getRefreshToken(): string | null {
    const encryptedToken = localStorage.getItem("refresh_token");
    return encryptedToken ? decryptData<string>(encryptedToken) : null;
  }

  public setTokens(tokens: TokenResponse): void {
    localStorage.setItem("access_token", encryptData(tokens.access));
    localStorage.setItem("refresh_token", encryptData(tokens.refresh));
  }

  public clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  public setUserData(user: User): void {
    localStorage.setItem("user", encryptData(user));
  }

  public getUserData(): User | null {
    const encryptedUser = localStorage.getItem("user");
    return encryptedUser ? decryptData<User>(encryptedUser) : null;
  }

  //   public async updateUserPreferences(
  //     preferences: IUserPreferences
  //   ): Promise<IMerchant> {
  //     const user = this.getUserData();
  //     if (!user) {
  //       throw new Error("No user data found");
  //     }

  //     const updatedUser = {
  //       ...user,
  //       preferences: {
  //         ...user.preferences,
  //         ...preferences,
  //       },
  //     };

  //     const response = await this.put<IMerchant>(
  //       `${API_CONFIG.path.users}/${user.id}`,
  //       { preferences: updatedUser.preferences }
  //     );

  //     this.setUserData(response);
  //     return response;
  //   }

  public clearUserData(): void {
    localStorage.removeItem("user");
  }

  public clearAllData(): void {
    this.clearTokens();
    this.clearUserData();
    localStorage.removeItem("tempProfilePic");
  }

  public async getCurrentUser(): Promise<User> {
    const response = await this.get<User>(API_CONFIG.path.currentUser);
    return response;
  }

  private getUrl(
    url: string,
    params: Record<string, string | number | boolean> = {}
  ): string {
    const queryString = Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
    return queryString ? `${url}/?${queryString}` : url + "/";
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private convertKeysToSnakeCase<T>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertKeysToSnakeCase(item)) as T;
    }
    if (obj !== null && typeof obj === "object") {
      return Object.keys(obj as Record<string, unknown>).reduce(
        (result, key) => {
          if (ignoreSnakeCase.includes(key)) {
            return result;
          }
          const snakeKey = this.toSnakeCase(key);
          (result as Record<string, unknown>)[snakeKey] =
            this.convertKeysToSnakeCase((obj as Record<string, unknown>)[key]);

          return result;
        },
        {} as T
      );
    }
    return obj;
  }

  private async commonAxios<T>({
    method,
    url,
    data,
    config = {},
    isAccessTokenRequire = true,
    contentType = "application/json",
  }: {
    method: string;
    url: string;
    data?: unknown;
    config?: AxiosRequestConfig;
    isAccessTokenRequire?: boolean;
    contentType?: string;
  }): Promise<T> {
    // Handle FormData differently from regular JSON data
    let requestData: unknown;
    const requestHeaders: Record<string, string> = {};

    if (data instanceof FormData) {
      requestData = data;
      // Don't set Content-Type for FormData
    } else {
      requestHeaders["Content-Type"] = contentType;
      if (data) {
        // Don't convert to snake_case - backend expects camelCase
        requestData =
          contentType === "application/json" ? JSON.stringify(data) : data;
      } else {
        requestData = undefined;
      }
    }

    if (isAccessTokenRequire) {
      const token = this.getAccessToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return new Promise((resolve, reject) => {
      this.axiosInstance({
        method,
        url,
        headers: requestHeaders,
        ...config,
        data: requestData,
        cancelToken: new axios.CancelToken((c) => {
          this.cancelToken = c;
        }),
      })
        .then((response: AxiosResponse<ResponseObj<T>>) => {
          if (response.data.isError) {
            reject(new Error(response.data.message || "An error occurred"));
            return;
          }
          resolve(response.data.data);
        })
        .catch((error) => {
          if (error.response?.data) {
            const apiError = error.response.data as ResponseObj<unknown>;
            if (apiError.message) {
              reject(new Error(apiError.message || "An error occurred"));
            }
            reject(new Error(apiError.message || "An error occurred"));
          } else {
            reject(error);
          }
        });
    });
  }

  public cancelRequest(): void {
    if (this.cancelToken) {
      this.cancelToken();
    }
  }

  public async get<T>(
    url: string,
    params: Record<string, string | number | boolean> = {},
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.commonAxios<T>({
      method: "GET",
      url: this.getUrl(url, params),
      config,
    });
  }

  public async post<T, D = Record<string, unknown> | FormData>(
    url: string,
    data?: D,
    queryParams: Record<string, string | number | boolean> = {},
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.commonAxios<T>({
      method: "POST",
      url: this.getUrl(url, queryParams),
      data,
      config,
    });
  }

  public async put<T, D = Record<string, unknown> | FormData>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.commonAxios<T>({
      method: "PUT",
      url: url + "/",
      data,
      config,
    });
  }

  public async delete<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.commonAxios<T>({
      method: "DELETE",
      url: url + "/",
      data,
      config,
    });
  }

  public async patch<T, D = Record<string, unknown> | FormData>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.commonAxios<T>({
      method: "PATCH",
      url: url + "/",
      data,
      config,
    });
  }

  /**
   * Calls the logout API endpoint to log the user out on the backend.
   */
  public async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    await this.post(API_CONFIG.path.logout, {
      refresh_token: refreshToken,
    });
  }
}

export const httpService = HttpService.getInstance();

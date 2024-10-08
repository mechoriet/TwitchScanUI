export class TwitchLogin {
    id: string;
    displayName: string;
    email: string;
    profileImageUrl: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;

    constructor(id: string, accessToken: string, refreshToken: string, expiresIn: string, displayName: string, email: string, profileImageUrl: string) {
        this.id = id;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.displayName = displayName;
        this.email = email;
        this.profileImageUrl = profileImageUrl;
    }
}
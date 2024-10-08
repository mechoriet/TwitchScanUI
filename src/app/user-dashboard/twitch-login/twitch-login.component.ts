import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TwitchAuthService } from '../../services/twitch-service/twitch-auth.service';

@Component({
    selector: 'app-twitch-login',
    template: `<p class="mt-5 text-center text-light">Processing login... Please wait. <i class="fas fa-cog fa-spin"></i></p>`,
})
export class TwitchLoginComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private twitchAuthService: TwitchAuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Get the 'code' query parameter from the URL
        this.route.queryParams.subscribe((params) => {
            const code = params['code'];
            console.log(code);
            if (code) {
                // Handle the callback by exchanging the code for tokens
                this.twitchAuthService.handleAuthCallback(code).subscribe({
                    next: () => this.twitchAuthService.completeLogin(),
                    error: (error) => this.router.navigate([''])
            });
            } else {
                // No code in URL, navigate to error page
                this.router.navigate(['']);
            }
        });
    }
}

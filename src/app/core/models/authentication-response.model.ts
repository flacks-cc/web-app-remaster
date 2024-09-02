export interface AuthenticationResponse {
  access_token: string;
  message: string;
  authorities: GrantedAuthority[];
}

export interface GrantedAuthority {
  authority: string;
}


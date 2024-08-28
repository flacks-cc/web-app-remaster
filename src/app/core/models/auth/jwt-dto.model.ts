export interface JwtDto {
  token: string;
  username: string;
  authorities: Authority[];
  infoVerified: boolean;
}

export interface Authority {
  authority: string;
}
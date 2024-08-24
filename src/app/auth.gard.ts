import { CanActivate, ExecutionContext } from '@nestjs/common';
import { IAuthenticator } from 'src/services/authenticator';
import { extractToken } from './extract-token';

export class AuthGard implements CanActivate {
  constructor(private readonly authenticator: IAuthenticator) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = extractToken(request.headers.authorization);
    if (!token) {
      return false;
    }
    try {
      const user = await this.authenticator.authenticate(token);
      request.user = user;
      return true;
    } catch (e) {
      return false;
    }
  }
}

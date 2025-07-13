import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AnyAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Try normal user JWT
    try {
      await new (AuthGuard('jwt'))().canActivate(context);
      return true;
    } catch {}

    // Try superadmin JWT
    try {
      await new (AuthGuard('superadmin-jwt'))().canActivate(context);
      return true;
    } catch {}

    // If neither works, deny access
    return false;
  }
}
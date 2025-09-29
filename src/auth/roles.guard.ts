import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) {}
  
    canActivate(context: ExecutionContext): boolean {

      const req = context.switchToHttp().getRequest();

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );    
      if (!requiredRoles) {
        return true;
      }

      try {
        const authHeader = req.headers.authorization;
        const bearer = authHeader.split(' ')[0];
        const token = authHeader.split(' ')[1];
  
        if (bearer !== 'Bearer' || !token) {
          throw new UnauthorizedException({
            message: 'Пользователь не авторизован',
          });
        }
        const user = this.jwtService.verify(token);
        console.log('User roles:', user.roles);
        req.user = user;
  
        return user.roles.some((r) => requiredRoles.includes(r.name));
      } catch (error) {
        throw new HttpException('У вас нет доступа', HttpStatus.FORBIDDEN);
      }
    }
  }
  
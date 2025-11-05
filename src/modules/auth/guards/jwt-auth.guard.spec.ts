import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new JwtAuthGuard(reflector);
  });

  it('should return true if route is public', () => {
    const mockContext = {
      getHandler: jest.fn().mockReturnValue(() => {}),
      getClass: jest.fn().mockReturnValue(class {}),
    } as unknown as ExecutionContext;

    // Simulate @Public() decorator applied
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(expect.any(String), [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    expect(result).toBe(true);
  });

  it('should call super.canActivate when route is not public', () => {
    const mockContext = {
      getHandler: jest.fn().mockReturnValue(() => {}),
      getClass: jest.fn().mockReturnValue(class {}),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    // Mock super.canActivate
    const superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(expect.any(String), [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);
  });
});

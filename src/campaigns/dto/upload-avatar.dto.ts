import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (JPEG, PNG, GIF, WebP, max 5MB)',
  })
  avatar: Express.Multer.File;
}

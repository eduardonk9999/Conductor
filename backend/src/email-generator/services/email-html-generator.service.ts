import { Injectable } from '@nestjs/common';
import juice from 'juice';
import { TemplateArea } from '../../templates/schemas/template.schema';

@Injectable()
export class EmailHtmlGeneratorService {
  generateEmailHtml(
    areas: TemplateArea[],
    emailWidth: number = 600,
    backgroundColor: string = '#ffffff',
    baseUrl: string = '',
  ): string {
    const sortedAreas = [...areas].sort((a, b) => a.y - b.y);
    const base = (baseUrl || '').replace(/\/$/, '');

    let htmlContent = this.getEmailHeader(emailWidth, backgroundColor);

    for (const area of sortedAreas) {
      htmlContent += this.generateAreaHtml(area, emailWidth, base);
    }

    htmlContent += this.getEmailFooter();

    return juice(htmlContent);
  }

  private getEmailHeader(width: number, bgColor: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, address=no, email=no">
  <title>Email Marketing</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; }
    table { border-spacing: 0; border-collapse: collapse; }
    img { border: 0; display: block; outline: none; text-decoration: none; max-width: 100%; height: auto; }
    a { text-decoration: none; }
    .email-container { width: 100%; max-width: ${width}px; }
    .mobile-hide { display: block; }
    .mobile-padding { padding: 16px 20px; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 12px 0 !important; }
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 12px 16px !important; }
      .mobile-hide { display: none !important; }
      .mobile-full-width { width: 100% !important; }
      .mobile-text { font-size: 15px !important; line-height: 1.5 !important; }
      .mobile-button { display: block !important; width: 100% !important; max-width: 280px !important; margin: 0 auto !important; box-sizing: border-box !important; text-align: center !important; min-height: 44px !important; padding: 14px 24px !important; line-height: 1.3 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; -webkit-text-size-adjust: 100%;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 20px 0;">
        <table class="email-container" role="presentation" width="${width}" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bgColor}; max-width: ${width}px;">
`;
  }

  private getEmailFooter(): string {
    return `
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  }

  private generateAreaHtml(area: TemplateArea, emailWidth: number, baseUrl: string = ''): string {
    switch (area.type) {
      case 'image':
        return this.generateImageArea(area, baseUrl);
      case 'color':
        return this.generateColorBlock(area);
      case 'text':
        return this.generateTextArea(area, emailWidth);
      case 'button':
        return this.generateButtonArea(area, emailWidth, baseUrl);
      case 'spacer':
        return this.generateSpacerArea(area);
      default:
        return '';
    }
  }

  private toAbsoluteUrl(path: string, baseUrl: string): string {
    if (!path || !baseUrl) return path;
    if (path.startsWith('http')) return path;
    return baseUrl + (path.startsWith('/') ? path : '/' + path);
  }

  private generateColorBlock(area: TemplateArea): string {
    const bgColor = area.styles?.backgroundColor || '#f0f0f0';
    const height = Math.round(area.height || 20);

    return `
          <tr>
            <td style="background-color: ${bgColor}; height: ${height}px; line-height: 1px; font-size: 1px;">&nbsp;</td>
          </tr>
`;
  }

  private generateImageArea(area: TemplateArea, baseUrl: string = ''): string {
    const w = Math.round(area.width || 0) || 1;
    const h = Math.round(area.height || 0) || 1;
    const rawSrc = area.content || '';
    const src = this.toAbsoluteUrl(rawSrc, baseUrl).replace(/"/g, '&quot;');

    return `
          <tr>
            <td align="center" style="padding: 0;">
              <img src="${src}" alt="" width="${w}" height="${h}" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0;">
            </td>
          </tr>
`;
  }

  private escapeHtml(text: string): string {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private generateTextArea(area: TemplateArea, emailWidth: number): string {
    const styles = area.styles || {};
    const fontSize = styles.fontSize || 16;
    const color = styles.color || '#333333';
    const textAlign = styles.textAlign || 'left';
    const padding = styles.padding || '10px 20px';
    const fontWeight = styles.fontWeight || 'normal';
    const safeContent = this.escapeHtml(area.content || '').replace(/\n/g, '<br>');

    return `
          <tr>
            <td class="mobile-padding mobile-text" style="padding: ${padding}; font-size: ${fontSize}px; color: ${color}; text-align: ${textAlign}; font-weight: ${fontWeight}; line-height: 1.5;">
              ${safeContent}
            </td>
          </tr>
`;
  }

  private generateButtonArea(area: TemplateArea, emailWidth: number, baseUrl: string = ''): string {
    const isImageButton = area.content && (area.content.startsWith('/') || area.content.startsWith('http'));
    if (isImageButton) {
      const w = Math.round(area.width || 0) || 1;
      const h = Math.round(area.height || 0) || 1;
      const href = (area.link || '#').replace(/"/g, '&quot;');
      const src = this.toAbsoluteUrl(area.content || '', baseUrl).replace(/"/g, '&quot;');
      return `
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${href}" target="_blank" style="display: block;">
                <img src="${src}" alt="" width="${w}" height="${h}" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0;">
              </a>
            </td>
          </tr>
`;
    }
    const styles = area.styles || {};
    const bgColor = styles.backgroundColor || '#007bff';
    const color = styles.color || '#ffffff';
    const fontSize = styles.fontSize || 16;
    const padding = styles.padding || '12px 30px';
    const borderRadius = styles.borderRadius || '4px';

    return `
          <tr>
            <td align="center" class="mobile-padding" style="padding: 20px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="border-radius: ${borderRadius}; background-color: ${bgColor};">
                    <a href="${(area.link || '#').replace(/"/g, '&quot;')}" target="_blank" class="mobile-button" style="display: inline-block; padding: ${padding}; font-size: ${fontSize}px; color: ${color}; text-decoration: none; font-weight: bold; border-radius: ${borderRadius};">
                      ${this.escapeHtml(area.content || 'Clique aqui')}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`;
  }

  private generateSpacerArea(area: TemplateArea): string {
    const height = Math.round(area.height || 20);

    return `
          <tr>
            <td style="height: ${height}px; line-height: ${height}px; font-size: 1px;">&nbsp;</td>
          </tr>
`;
  }
}

import { Injectable } from '@nestjs/common';
import juice from 'juice';
import { TemplateArea } from '../../templates/schemas/template.schema';

@Injectable()
export class EmailHtmlGeneratorService {
  generateEmailHtml(
    areas: TemplateArea[],
    emailWidth: number = 600,
    backgroundColor: string = '#ffffff',
  ): string {
    const sortedAreas = [...areas].sort((a, b) => a.y - b.y);

    let htmlContent = this.getEmailHeader(emailWidth, backgroundColor);

    for (const area of sortedAreas) {
      htmlContent += this.generateAreaHtml(area, emailWidth);
    }

    htmlContent += this.getEmailFooter();

    // Inline CSS para compatibilidade com clientes de email
    return juice(htmlContent);
  }

  private getEmailHeader(width: number, bgColor: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Marketing</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      font-family: Arial, sans-serif;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    img {
      border: 0;
      display: block;
      outline: none;
      text-decoration: none;
    }
    .mobile-hide {
      display: block;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-full-width {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
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

  private generateAreaHtml(area: TemplateArea, emailWidth: number): string {
    switch (area.type) {
      case 'image':
        return this.generateImageArea(area);
      case 'color':
        return this.generateColorBlock(area);
      case 'text':
        return this.generateTextArea(area, emailWidth);
      case 'button':
        return this.generateButtonArea(area, emailWidth);
      case 'spacer':
        return this.generateSpacerArea(area);
      default:
        return '';
    }
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

  private generateImageArea(area: TemplateArea): string {
    const width = Math.round(area.width);
    const height = Math.round(area.height);

    return `
          <tr>
            <td align="center" style="padding: 0;">
              <img src="${area.content || ''}" alt="" width="${width}" height="${height}" style="display: block; width: 100%; max-width: ${width}px; height: auto;">
            </td>
          </tr>
`;
  }

  private generateTextArea(area: TemplateArea, emailWidth: number): string {
    const styles = area.styles || {};
    const fontSize = styles.fontSize || 16;
    const color = styles.color || '#333333';
    const textAlign = styles.textAlign || 'left';
    const padding = styles.padding || '10px 20px';
    const fontWeight = styles.fontWeight || 'normal';

    return `
          <tr>
            <td style="padding: ${padding}; font-size: ${fontSize}px; color: ${color}; text-align: ${textAlign}; font-weight: ${fontWeight}; line-height: 1.5;">
              ${area.content || ''}
            </td>
          </tr>
`;
  }

  private generateButtonArea(area: TemplateArea, emailWidth: number): string {
    const isImageButton = area.content && (area.content.startsWith('/') || area.content.startsWith('http'));
    if (isImageButton) {
      const width = Math.round(area.width);
      const height = Math.round(area.height);
      return `
          <tr>
            <td align="center" style="padding: 0;">
              <a href="${area.link || '#'}" target="_blank" style="display: block;">
                <img src="${area.content}" alt="" width="${width}" height="${height}" style="display: block; width: 100%; max-width: ${width}px; height: auto; border: 0;">
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
            <td align="center" style="padding: 20px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: ${borderRadius}; background-color: ${bgColor};">
                    <a href="${area.link || '#'}" target="_blank" style="display: inline-block; padding: ${padding}; font-size: ${fontSize}px; color: ${color}; text-decoration: none; font-weight: bold; border-radius: ${borderRadius};">
                      ${area.content || 'Clique aqui'}
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

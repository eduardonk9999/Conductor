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
    return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no">
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <title>Email Marketing</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; display: block; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    .email-container { width: 100%; max-width: ${width}px; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 8px 0 !important; }
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 12px 16px !important; }
      .mobile-img { width: 100% !important; height: auto !important; max-width: 100% !important; }
      .mobile-text { font-size: 15px !important; line-height: 1.5 !important; }
      .mobile-button { display: block !important; width: auto !important; max-width: 260px !important; margin: 0 auto !important; text-align: center !important; padding: 14px 24px !important; }
      .mobile-hide { display: none !important; }
      .mobile-full { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f4f4" style="background-color:#f4f4f4;"><tr><td><![endif]-->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" class="email-wrapper" style="padding:20px 0;">
        <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}" bgcolor="${bgColor}"><tr><td><![endif]-->
        <table class="email-container" role="presentation" width="${width}" border="0" cellspacing="0" cellpadding="0" style="background-color:${bgColor};max-width:${width}px;">
`;
  }

  private getEmailFooter(): string {
    return `        </table>
        <!--[if mso | IE]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso | IE]></td></tr></table><![endif]-->
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

  private escapeHtml(text: string): string {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private generateColorBlock(area: TemplateArea): string {
    const bgColor = area.styles?.backgroundColor || '#f0f0f0';
    const height = Math.max(1, Math.round(area.height || 20));

    return `          <tr>
            <td style="background-color:${bgColor};height:${height}px;line-height:${height}px;font-size:1px;">&nbsp;</td>
          </tr>\n`;
  }

  private generateImageArea(area: TemplateArea, baseUrl: string = ''): string {
    const w = Math.max(1, Math.round(area.width || 0));
    const h = Math.max(1, Math.round(area.height || 0));
    const rawSrc = area.content || '';
    const src = this.toAbsoluteUrl(rawSrc, baseUrl).replace(/"/g, '&quot;');
    const href = area.link ? area.link.replace(/"/g, '&quot;') : null;

    const imgTag = `<img src="${src}" alt="" width="${w}" height="${h}" class="mobile-img" style="display:block;width:100%;max-width:100%;height:auto;border:0;-ms-interpolation-mode:bicubic;">`;

    const inner = href
      ? `<a href="${href}" target="_blank" style="display:block;">${imgTag}</a>`
      : imgTag;

    return `          <tr>
            <td align="center" style="padding:0;font-size:0;line-height:0;">
              ${inner}
            </td>
          </tr>\n`;
  }

  private generateTextArea(area: TemplateArea, emailWidth: number): string {
    const styles = area.styles || {};
    const fontSize = styles.fontSize || 16;
    const color = styles.color || '#333333';
    const textAlign = styles.textAlign || 'left';
    const padding = styles.padding || '12px 24px';
    const fontWeight = styles.fontWeight || 'normal';
    const lineHeight = Math.round((styles.fontSize || 16) * 1.6);
    const safeContent = this.escapeHtml(area.content || '').replace(/\n/g, '<br>');

    return `          <tr>
            <td class="mobile-padding mobile-text" style="padding:${padding};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:${lineHeight}px;color:${color};text-align:${textAlign};font-weight:${fontWeight};">
              ${safeContent}
            </td>
          </tr>\n`;
  }

  private generateButtonArea(area: TemplateArea, emailWidth: number, baseUrl: string = ''): string {
    // Botão que é recorte de imagem (content começa com / ou http)
    const isImageButton = area.content && (area.content.startsWith('/') || area.content.startsWith('http'));
    if (isImageButton) {
      const w = Math.max(1, Math.round(area.width || 0));
      const h = Math.max(1, Math.round(area.height || 0));
      const href = (area.link || '#').replace(/"/g, '&quot;');
      const src = this.toAbsoluteUrl(area.content || '', baseUrl).replace(/"/g, '&quot;');
      return `          <tr>
            <td align="center" style="padding:0;font-size:0;line-height:0;">
              <a href="${href}" target="_blank" style="display:block;">
                <img src="${src}" alt="" width="${w}" height="${h}" class="mobile-img" style="display:block;width:100%;max-width:100%;height:auto;border:0;-ms-interpolation-mode:bicubic;">
              </a>
            </td>
          </tr>\n`;
    }

    // Botão HTML com texto
    const styles = area.styles || {};
    const bgColor = styles.backgroundColor || '#007bff';
    const color = styles.color || '#ffffff';
    const fontSize = styles.fontSize || 16;
    const padding = styles.padding || '14px 32px';
    const borderRadius = styles.borderRadius || '4px';
    const href = (area.link || '#').replace(/"/g, '&quot;');
    const label = this.escapeHtml(area.content || 'Clique aqui');

    // VML fallback para Outlook (renderiza o botão corretamente)
    const [pt, pr, pb, pl] = this.parsePadding(padding);
    const btnWidth = Math.round(area.width * 0.6) || 200;

    return `          <tr>
            <td align="center" class="mobile-padding" style="padding:20px 24px;">
              <!--[if mso | IE]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                href="${href}" style="height:auto;mso-width-percent:${btnWidth};" arcsize="${Math.round((parseInt(borderRadius) / 50) * 100)}%"
                stroke="f" fillcolor="${bgColor}">
                <w:anchorlock/>
                <center style="color:${color};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:bold;">${label}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="border-radius:${borderRadius};background-color:${bgColor};">
                    <a href="${href}" target="_blank" class="mobile-button"
                       style="display:inline-block;padding:${padding};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;color:${color};text-decoration:none;font-weight:bold;border-radius:${borderRadius};mso-hide:all;">
                      ${label}
                    </a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>\n`;
  }

  private parsePadding(padding: string): [number, number, number, number] {
    const parts = padding.trim().split(/\s+/).map((p) => parseInt(p) || 0);
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    return [parts[0], parts[1], parts[2], parts[3]];
  }

  private generateSpacerArea(area: TemplateArea): string {
    const height = Math.max(1, Math.round(area.height || 20));

    return `          <tr>
            <td style="height:${height}px;line-height:${height}px;font-size:1px;mso-line-height-rule:exactly;">&nbsp;</td>
          </tr>\n`;
  }
}

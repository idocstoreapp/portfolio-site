import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { readFile } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { createProposalsTable } from '../../database/migrations/create_proposals_table';
import { createProposalTemplateBlocksTable } from '../../database/migrations/create_proposal_template_blocks';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import * as puppeteer from 'puppeteer';

const BUCKET_NAME = 'proposals';
const STORAGE_PATH_PREFIX = 'proposals';

const SUBTITLES: Record<string, string> = {
  restaurante: 'Menú QR · Automatización · Administración',
  taller: 'Órdenes de trabajo · Inventario · Técnicos · Reportes',
  'servicio-tecnico': 'Órdenes de trabajo · Clientes · Seguimiento',
  generic: 'Diseño web · Experiencia móvil · Contenido a medida',
};

const DEFAULT_LOGO_CLIENTE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="56"%3E%3Crect fill="%23ddd" width="180" height="56" rx="4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="14"%3ELogo%3C/text%3E%3C/svg%3E';
const DEFAULT_LOGO_MAESTRO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="140" height="48"%3E%3Crect fill="%231a1a2e" width="140" height="48" rx="4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="11"%3EMaestro%20Digital%3C/text%3E%3C/svg%3E';
const DEFAULT_MOCKUP =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect fill="%23f0f0f0" width="320" height="200" rx="8"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EMockup%3C/text%3E%3C/svg%3E';

const TEMPLATE_NAMES: Record<string, string> = {
  generic: 'Genérica',
  restaurante: 'Restaurante',
  'servicio-tecnico': 'Servicio técnico',
  taller: 'Taller',
};

/** Categorización: rubro + tipo de oferta para que cada PDF tenga diseño distinto */
export const TEMPLATE_META: Record<
  string,
  { rubro: string; tipoOferta: string; descripcion: string }
> = {
  generic: {
    rubro: 'Página web',
    tipoOferta: 'Diseño web',
    descripcion: 'Propuesta de diseño web: portada con mockups repartidos (móvil, escritorio, sección interna), páginas 2-4 con imagen grande cada una, estilo editorial azul/índigo distinto a servicio técnico.',
  },
  restaurante: {
    rubro: 'Restaurante',
    tipoOferta: 'Sistema',
    descripcion: 'Propuesta editorial restaurante: menú QR, panel pedidos, experiencia cliente. Portada flex, páginas 2-4 con imagen grande + guía + chips, sin medias páginas vacías. Paleta verde + terracotta.',
  },
  taller: {
    rubro: 'Taller',
    tipoOferta: 'Sistema',
    descripcion: 'Propuesta editorial taller: web móvil/escritorio, panel admin y catálogo, órdenes de trabajo, métricas, PDF orden e inventario. Estilo MiMoto (rojo/gris), 6 páginas sin vacíos.',
  },
  'servicio-tecnico': {
    rubro: 'Servicio técnico',
    tipoOferta: 'Sistema',
    descripcion: 'Órdenes, clientes, seguimiento. Diseño técnico azul/gris.',
  },
};

const DEFAULT_COLOR_PRIMARY = '#c41e3a';
const DEFAULT_COLOR_SECONDARY = '#2d2d2d';

import { PRICING_CATALOG, PlanKey, ProductConfig } from './pricing-catalog';

const DEFAULT_TEMPLATE_BLOCKS: Record<string, Record<string, string>> = {
  generic: {
    cover_letter_text:
      '<span class="drop-cap">E</span>stimado equipo de {{cliente}}, con esta propuesta les presentamos una opción de diseño web pensada para que su negocio tenga presencia digital clara y profesional. No es un diseño cerrado: la idea es que ustedes opinen sobre estructura, colores y textos, y lo adaptemos a su identidad.<br/><br/>En las siguientes páginas verán cómo podría verse su sitio: página de inicio, secciones internas y experiencia en escritorio y móvil. Los mockups son una guía visual para conversar y definir juntos el resultado final. Quedamos atentos a sus comentarios y consultas.',
    closing_message:
      'Espero que la presentación sea de su agrado. Quedo atento a cualquier consulta por WhatsApp o correo para avanzar con el proyecto.',
    body_text:
      'A continuación los planes disponibles para su sitio web. Cada uno incluye diseño, desarrollo, contenido inicial y soporte. Los precios son referenciales y pueden ajustarse según el alcance que definamos.',
    page1_after_mockup:
      '<ul class="cover-benefits"><li><strong>Diseño a medida</strong> adaptado a su marca y a lo que sus clientes buscan</li><li><strong>Buena experiencia</strong> en celular y en escritorio</li><li><strong>Contenido y estructura</strong> pensados para que el sitio sume y no solo “esté”</li></ul>',
    color_primary: DEFAULT_COLOR_PRIMARY,
    color_secondary: DEFAULT_COLOR_SECONDARY,
    qr_image: '',
  },
  restaurante: {
    cover_letter_text:
      '<span class="drop-cap">Q</span>uerido equipo de <strong>{{cliente}}</strong>,<br/><br/>' +
      'Sabemos lo que implica sacar adelante un restaurante: que la cocina no se retrase, que los pedidos no se pierdan y que sus comensales vivan una experiencia que los haga volver. Por eso armamos esta propuesta pensada solo para ustedes.<br/><br/>' +
      'Imagínense que en cada mesa está su menú, siempre al día y con fotos, y que el cliente puede pedir desde su celular sin esperar al mesero. Que cocina y caja reciben cada pedido al instante y que ustedes ven, en un solo panel, qué mesas están comiendo, qué está en preparación y qué ya se cobró.<br/><br/>' +
      'En las siguientes páginas verán cómo se ve todo eso: menú digital con QR, panel de gestión de mesas y pedidos, métricas de ventas y ejemplos de boletas y comandas. La idea es que puedan revisar cada pantalla con calma y decidir si este sistema les calza para el día a día de su local.',
    closing_message:
      'Quedo atento a su respuesta. Cualquier consulta, escanee el QR o escriba por WhatsApp.',
    body_text:
      'A continuación los planes disponibles. Cada uno incluye implementación, capacitación y soporte. Precios referenciales.',
    page1_after_mockup:
      '<p class="rest-ed-benefits-intro">Con esta propuesta su restaurante gana:</p><ul class="cover-benefits"><li><strong>Más ventas</strong> con menú QR en mesa y pedidos desde el celular del comensal</li><li><strong>Menos errores</strong> con pedidos directos a cocina y caja, sin papeles sueltos</li><li><strong>Mejor control</strong> con reportes y gestión de mesas en tiempo real</li><li><strong>Tranquilidad</strong> porque todo queda registrado: boletas, comandas y ventas del día</li></ul>',
    color_primary: '#1a5f4a',
    color_secondary: '#2d3d35',
    qr_image: '',
  },
  'servicio-tecnico': {
    cover_letter_text:
      '<span class="drop-cap">E</span>stimado equipo de {{cliente}}, es un gusto presentarles esta evaluación y propuesta pensada especialmente para su servicio técnico de Netbook y Notebook.<br/><br/>En las siguientes páginas verán cómo quedaría una plataforma completa para ordenar el trabajo diario: cada ingreso queda registrado como una orden de trabajo con datos del cliente, equipo, diagnóstico, repuestos y estado. Desde el celular podrán crear órdenes en recepción, y desde el panel ver el avance de cada reparación sin depender de planillas o papeles sueltos.<br/><br/>El objetivo es que toda la información viva en un solo lugar: quién trajo el equipo, qué se le hizo, qué repuestos se usaron y cuánto se cobró. Con esto es mucho más fácil responder preguntas de sus clientes, evitar pérdidas de equipos y tener claridad sobre qué servicios son los que más venden.<br/><br/>Esta propuesta no es un diseño cerrado, sino un punto de partida. La idea es que ustedes puedan opinar sobre cada pantalla y que, en base a su forma real de trabajar, ajustemos flujos, textos y reportes. Lo importante es que el sistema les sirva en el día a día y no al revés.',
    closing_message:
      'Quedo atento a su respuesta. Escanee el QR o escriba por WhatsApp para cualquier consulta o para que agendemos una llamada corta de revisión.',
    body_text:
      'A continuación se muestran los planes disponibles. Cada uno incluye implementación inicial, carga básica de datos, capacitación a su equipo y soporte. Los precios son referenciales y podemos ajustarlos según el alcance final del proyecto, módulos adicionales o integraciones que puedan necesitar.',
    page1_after_mockup:
      '<ul class="cover-benefits"><li><strong>Órdenes claras</strong> con cliente, equipo, diagnóstico, repuestos y total en un solo documento PDF</li><li><strong>Seguimiento en tiempo real</strong> del estado de cada reparación (ingresado, en diagnóstico, en reparación, listo para retirar, entregado)</li><li><strong>Historial de clientes</strong> para saber qué equipos se atendieron, cuántas veces y con qué resultados</li><li><strong>Menos pérdidas y reclamos</strong> porque siempre se puede ver qué se hizo, quién lo hizo y qué se cobró</li><li><strong>Información para decidir</strong> con reportes simples de servicios más vendidos, tiempos de reparación y uso de repuestos</li></ul>',
    color_primary: '#2563eb',
    color_secondary: '#334155',
    qr_image: '',
  },
  taller: {
    cover_letter_text:
      '<span class="drop-cap">Q</span>uerido equipo de <strong>{{cliente}}</strong>,<br/><br/>' +
      'Sabemos que un taller vive de órdenes de trabajo claras, un catálogo de repuestos y accesorios bajo control y la posibilidad de ver en un solo lugar qué está en curso, qué se vendió y qué hay en stock. Por eso armamos esta propuesta pensada solo para ustedes.<br/><br/>' +
      'En las siguientes páginas verán la web de su taller (móvil y escritorio), el panel de administración con catálogo e inventario, cómo se generan y siguen las órdenes de trabajo, las métricas de ventas y el PDF que recibe el cliente. También el control de stock para que no les falte ningún repuesto crítico.<br/><br/>' +
      'La idea es que puedan revisar cada pantalla con calma y decirnos si algo se ajusta o no a su forma de trabajar. Cualquier duda, estamos a un mensaje.',
    closing_message:
      'Quedo atento a su respuesta. Escanee el QR o escriba por WhatsApp para cualquier consulta.',
    body_text:
      'A continuación los planes disponibles. Cada uno incluye implementación, capacitación y soporte. Precios referenciales.',
    page1_after_mockup:
      '<p class="tall-ed-benefits-intro">Con esta propuesta su taller gana:</p><ul class="cover-benefits"><li><strong>Órdenes de trabajo</strong> con cliente, vehículo, repuestos y PDF para el cliente</li><li><strong>Panel admin</strong> con catálogo, inventario y control de stock</li><li><strong>Métricas de ventas</strong> y reportes para decidir con datos</li><li><strong>Web profesional</strong> móvil y escritorio con contacto y WhatsApp</li></ul>',
    color_primary: '#c41e3a',
    color_secondary: '#2d2d2d',
    qr_image: '',
  },
};

export interface ProposalRow {
  id: string;
  diagnostic_id: string;
  business_name: string | null;
  solution: string | null;
  price: number | null;
  status: string;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ProposalService implements OnModuleInit {
  constructor(private readonly supabaseService: SupabaseService) {}

  async onModuleInit() {
    try {
      await createProposalsTable(this.supabaseService);
      await createProposalTemplateBlocksTable(this.supabaseService);
    } catch {
      // Ignore if migration fails (e.g. no DATABASE_URL)
    }
  }

  /** Lista de plantillas con categorización (rubro, tipo oferta, descripción) para diseño distinto por PDF. */
  getTemplateList(): {
    tipo: string;
    name: string;
    rubro: string;
    tipoOferta: string;
    descripcion: string;
  }[] {
    return Object.entries(TEMPLATE_NAMES).map(([tipo, name]) => ({
      tipo,
      name,
      ...(TEMPLATE_META[tipo] ?? {
        rubro: tipo,
        tipoOferta: 'Sistema',
        descripcion: `Plantilla ${name}.`,
      }),
    }));
  }

  /** Bloques editables de una plantilla (desde BD o valores por defecto). */
  async getTemplateBlocks(tipoNegocio: string): Promise<Record<string, string>> {
    const tipo =
      tipoNegocio === 'restaurante'
        ? 'restaurante'
        : tipoNegocio === 'taller'
          ? 'taller'
          : tipoNegocio === 'servicio-tecnico'
            ? 'servicio-tecnico'
            : 'generic';
    const defaults = DEFAULT_TEMPLATE_BLOCKS[tipo] ?? DEFAULT_TEMPLATE_BLOCKS.generic;
    try {
      const supabase = this.supabaseService.getAdminClient();
      const { data: rows, error } = await supabase
        .from('proposal_template_blocks')
        .select('block_key, content')
        .eq('tipo_negocio', tipo);
      if (error || !rows?.length) return { ...defaults };
      const out: Record<string, string> = { ...defaults };
      for (const row of rows) {
        if (row.block_key && typeof row.content === 'string') {
          out[row.block_key] = row.content;
        }
      }
      return out;
    } catch {
      return { ...defaults };
    }
  }

  /**
   * Genera HTML de vista previa para una plantilla con datos de ejemplo y bloques opcionales.
   * Útil para que el admin vea cómo quedará el PDF antes de guardar.
   */
  async getPreviewHtml(
    tipoNegocio: string,
    blocksOverride?: Record<string, string>,
  ): Promise<string> {
    const tipo =
      tipoNegocio === 'restaurante'
        ? 'restaurante'
        : tipoNegocio === 'taller'
          ? 'taller'
          : tipoNegocio === 'servicio-tecnico'
            ? 'servicio-tecnico'
            : 'generic';
    const blocks = blocksOverride ?? (await this.getTemplateBlocks(tipo));
    const colorPrimary =
      blocks.color_primary?.trim() || DEFAULT_COLOR_PRIMARY;
    const colorSecondary =
      blocks.color_secondary?.trim() || DEFAULT_COLOR_SECONDARY;
    const formatPrice = (p: number) => p.toLocaleString('es-CL');
    const defaultLogoTu = await this.getDefaultLogoMaestroDataUrl();
    const variables: Record<string, string> = {
      cliente: 'Cliente Demo',
      logoCliente: DEFAULT_LOGO_CLIENTE,
      logoTu: defaultLogoTu,
      mockup1: DEFAULT_MOCKUP,
      mockup2: DEFAULT_MOCKUP,
      mockup3: DEFAULT_MOCKUP,
      mockup4: DEFAULT_MOCKUP,
      mockup5: DEFAULT_MOCKUP,
      colorPrimary,
      colorSecondary,
      subtitle: SUBTITLES[tipo] ?? SUBTITLES.generic,
      precioBasico: formatPrice(this.getPricingForTemplate(tipo).plans.basic?.price ?? 149000),
      precioProfesional: formatPrice(this.getPricingForTemplate(tipo).plans.pro?.price ?? 497000),
      precioEnterprise: formatPrice(this.getPricingForTemplate(tipo).plans.enterprise?.price ?? 670000),
      cover_letter_text: blocks.cover_letter_text ?? '',
      closing_message: blocks.closing_message ?? '',
      body_text: blocks.body_text ?? '',
      page1_after_mockup: blocks.page1_after_mockup ?? '',
    };
    const qrImage = (blocks.qr_image || '').trim();
    variables.qr_html =
      qrImage && qrImage.startsWith('data:')
        ? `<img src="${qrImage.replace(/"/g, '&quot;').replace(/&/g, '&amp;')}" alt="QR WhatsApp" class="qr-image" />`
        : '<div class="qr-placeholder">QR WhatsApp</div>';
    let html = await this.loadTemplate(tipo);
    return this.injectVariables(html, variables);
  }

  /** Guarda los bloques editables de una plantilla. */
  async setTemplateBlocks(
    tipoNegocio: string,
    blocks: Record<string, string>,
  ): Promise<void> {
    const tipo =
      tipoNegocio === 'restaurante'
        ? 'restaurante'
        : tipoNegocio === 'taller'
          ? 'taller'
          : tipoNegocio === 'servicio-tecnico'
            ? 'servicio-tecnico'
            : 'generic';
    const supabase = this.supabaseService.getAdminClient();
    for (const [block_key, content] of Object.entries(blocks)) {
      if (block_key === undefined || block_key === null) continue;
      await supabase.from('proposal_template_blocks').upsert(
        {
          tipo_negocio: tipo,
          block_key,
          content: content ?? '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tipo_negocio,block_key' },
      );
    }
  }

  private async ensureBucketExists(): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (error && error.message?.toLowerCase().includes('already exists') === false) {
        console.warn('[proposal] ensureBucketExists:', error.message);
      }
    }
  }

  private getPriceByTipoEmpresa(tipoEmpresa: string | null): number {
    const { plans } = this.getPricingForBusinessType(tipoEmpresa);
    // Usar el plan Pro como referencia de precio base
    return plans.pro?.price ?? plans.basic?.price ?? 497;
  }

  /** Mapea el tipo de empresa del diagnóstico al productKey del catálogo de precios. */
  private getProductKeyFromBusinessType(tipoEmpresa: string | null | undefined): string {
    const t = String(tipoEmpresa ?? '').toLowerCase();
    if (t === 'restaurante') return 'restaurante';
    if (t === 'taller') return 'taller';
    if (t === 'servicio-tecnico') return 'servicio_tecnico';
    if (t === 'presencia-web' || t === 'pagina-web' || t === 'comercio' || t === 'servicios') return 'web';
    return 'web';
  }

  /** Obtiene los planes (basic/pro/enterprise) para un tipo de empresa. */
  private getPricingForBusinessType(tipoEmpresa: string | null | undefined): {
    product: ProductConfig;
    plans: { basic?: PlanConfig; pro?: PlanConfig; enterprise?: PlanConfig };
  } {
    const productKey = this.getProductKeyFromBusinessType(tipoEmpresa);
    const product = PRICING_CATALOG.products[productKey] ?? PRICING_CATALOG.products.web;
    const pickPlan = (key: PlanKey): PlanConfig | undefined => {
      const plan = product.plans[key];
      if (plan) return plan;
      const first = Object.values(product.plans)[0];
      return first as PlanConfig | undefined;
    };
    return {
      product,
      plans: {
        basic: pickPlan('basic'),
        pro: pickPlan('pro'),
        enterprise: pickPlan('enterprise'),
      },
    };
  }

  /** Igual que getPricingForBusinessType pero pensado para plantillas (tipoNorm). */
  private getPricingForTemplate(tipoNorm: string): {
    product: ProductConfig;
    plans: { basic?: PlanConfig; pro?: PlanConfig; enterprise?: PlanConfig };
  } {
    const tipoEmpresa =
      tipoNorm === 'restaurante'
        ? 'restaurante'
        : tipoNorm === 'taller'
          ? 'taller'
          : tipoNorm === 'servicio-tecnico'
            ? 'servicio-tecnico'
            : 'presencia-web';
    return this.getPricingForBusinessType(tipoEmpresa);
  }

  /**
   * Logo Maestro Digital por defecto: public/images/logo.png (raíz del repo o backend).
   * Si existe, se convierte a data URL; si no, se usa el SVG por defecto.
   */
  private async getDefaultLogoMaestroDataUrl(): Promise<string> {
    const candidates = [
      path.join(process.cwd(), 'public', 'images', 'logo.png'),
      path.join(process.cwd(), '..', 'public', 'images', 'logo.png'),
      path.join(__dirname, '..', '..', '..', '..', 'public', 'images', 'logo.png'), // backend/public cuando se corre desde dist
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        try {
          const buffer = await readFile(filePath);
          return `data:image/png;base64,${buffer.toString('base64')}`;
        } catch {
          break;
        }
      }
    }
    return DEFAULT_LOGO_MAESTRO;
  }

  private getTemplatesDir(): string {
    const fromDist = path.join(__dirname, 'templates');
    const fromSrc = path.join(process.cwd(), 'src', 'modules', 'proposal', 'templates');
    // Priorizar src para que los cambios en plantillas se vean sin recompilar (vista previa y PDF)
    if (fs.existsSync(fromSrc) && fs.existsSync(path.join(fromSrc, 'generic', 'template.html'))) {
      return fromSrc;
    }
    return fromDist;
  }

  private async loadTemplate(tipoNegocio: string): Promise<string> {
    const tipo =
      tipoNegocio === 'restaurante'
        ? 'restaurante'
        : tipoNegocio === 'taller'
          ? 'taller'
          : tipoNegocio === 'servicio-tecnico'
            ? 'servicio-tecnico'
            : 'generic';
    const dir = this.getTemplatesDir();
    const templatePath = path.join(dir, tipo, 'template.html');
    const cssPath = path.join(dir, 'base.css');
    const themePath = path.join(dir, tipo, 'theme.css');
    let template = await readFile(templatePath, 'utf-8');
    const css = await readFile(cssPath, 'utf-8');
    let themeCss = '';
    if (fs.existsSync(themePath)) {
      themeCss = await readFile(themePath, 'utf-8');
    }
    const themeClass = `theme-${tipo}`;
    template = template.replace(
      /<link\s+rel="stylesheet"\s+href="[^"]*base\.css"\s*\/?>/i,
      `<style>${css}</style>${themeCss ? `<style>${themeCss}</style>` : ''}`,
    );
    template = template.replace(/<body>/i, `<body class="${themeClass}">`);
    return template;
  }

  private buildVariablesForTemplate(
    proposal: ProposalRow,
    diagnostic: Record<string, unknown>,
    dto: GeneratePdfDto,
  ): Record<string, string> {
    const cliente = String(proposal.business_name ?? diagnostic?.empresa ?? diagnostic?.nombre ?? 'Cliente');
    const tipo =
      dto.tipoNegocio ||
      (diagnostic?.tipo_empresa as string) ||
      'generic';
    const tipoNorm =
      tipo === 'restaurante'
        ? 'restaurante'
        : tipo === 'taller'
          ? 'taller'
          : tipo === 'servicio-tecnico'
            ? 'servicio-tecnico'
            : 'generic';
    const { plans } = this.getPricingForTemplate(tipoNorm);
    const colorPrimary = dto.colorPrimary ?? '#c41e3a';
    const colorSecondary = dto.colorSecondary ?? '#2d2d2d';
    const formatPrice = (p: number) => p.toLocaleString('es-CL');
    return {
      cliente,
      logoCliente: dto.logoCliente && dto.logoCliente.startsWith('data:') ? dto.logoCliente : DEFAULT_LOGO_CLIENTE,
      logoTu: dto.logoTu && dto.logoTu.startsWith('data:') ? dto.logoTu : DEFAULT_LOGO_MAESTRO,
      mockup1: dto.mockup1 && dto.mockup1.startsWith('data:') ? dto.mockup1 : DEFAULT_MOCKUP,
      mockup2: dto.mockup2 && dto.mockup2.startsWith('data:') ? dto.mockup2 : DEFAULT_MOCKUP,
      mockup3: dto.mockup3 && dto.mockup3.startsWith('data:') ? dto.mockup3 : DEFAULT_MOCKUP,
      mockup4: dto.mockup4 && dto.mockup4.startsWith('data:') ? dto.mockup4 : (dto.mockup2 && dto.mockup2.startsWith('data:') ? dto.mockup2 : DEFAULT_MOCKUP),
      mockup5: dto.mockup5 && dto.mockup5.startsWith('data:') ? dto.mockup5 : (dto.mockup1 && dto.mockup1.startsWith('data:') ? dto.mockup1 : DEFAULT_MOCKUP),
      colorPrimary,
      colorSecondary,
      subtitle: dto.subtitle ?? SUBTITLES[tipoNorm] ?? SUBTITLES.generic,
      precioBasico: dto.precioBasico ?? formatPrice(plans.basic?.price ?? plans.pro?.price ?? 149000),
      precioProfesional: dto.precioProfesional ?? formatPrice(plans.pro?.price ?? plans.basic?.price ?? 497000),
      precioEnterprise: dto.precioEnterprise ?? formatPrice(plans.enterprise?.price ?? plans.pro?.price ?? 670000),
    };
  }

  private injectVariables(html: string, variables: Record<string, string>): string {
    let out = html;
    for (const [key, value] of Object.entries(variables)) {
      const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      out = out.replace(re, () => value);
    }
    return out;
  }

  private async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        // 'load' es más tolerante con recursos externos (fuentes, imágenes remotas)
        // y evita timeouts intermitentes al generar PDFs complejos.
        waitUntil: 'load',
        timeout: 60000,
      });
      await page.evaluate(() => document.fonts.ready);
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private async generateProposalPdf(
    proposal: ProposalRow,
    diagnostic: Record<string, unknown>,
  ): Promise<Buffer> {
    const businessName = proposal.business_name ?? 'Cliente';
    const solution = proposal.solution ?? 'Sistema de gestión y automatización';
    const price = proposal.price ?? 497;
    const date = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    p { margin: 8px 0; color: #333; }
    .price { font-size: 28px; font-weight: bold; margin-top: 24px; }
    .date { color: #666; font-size: 14px; margin-top: 32px; }
  </style>
</head>
<body>
  <h1>Propuesta comercial</h1>
  <p><strong>Business Name:</strong> ${escapeHtml(businessName)}</p>
  <p><strong>Solution:</strong> ${escapeHtml(solution)}</p>
  <p><strong>Price:</strong> $${price}</p>
  <p class="date">Date: ${escapeHtml(date)}</p>
</body>
</html>
`;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async createFromDiagnostic(diagnosticId: string): Promise<ProposalRow> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: diagnostic, error: diagError } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('id', diagnosticId)
      .limit(1)
      .single();

    if (diagError || !diagnostic) {
      throw new NotFoundException('Diagnostic not found');
    }

    const businessName =
      (diagnostic.empresa ?? diagnostic.nombre ?? null) as string | null;
    const solution = 'Sistema de gestión y automatización';
    const price = this.getPriceByTipoEmpresa(diagnostic.tipo_empresa ?? null);
    const status = 'pending';

    const proposalData = {
      diagnostic_id: diagnosticId,
      business_name: businessName,
      solution,
      price,
      status,
      pdf_url: null,
    };

    const { data: proposal, error: insertError } = await supabase
      .from('proposals')
      .insert([proposalData])
      .select()
      .single();

    if (insertError) {
      throw new InternalServerErrorException(
        `Error creating proposal: ${insertError.message}`,
      );
    }

    return proposal as ProposalRow;
  }

  /**
   * Genera el PDF de la propuesta con las plantillas (proposal-generator)
   * y los datos del editor (logos, mockups, colores). Sube a Storage y actualiza lead.
   */
  async generatePdfWithTemplates(proposalId: string, dto: GeneratePdfDto): Promise<ProposalRow> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: proposal, error: propError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (propError || !proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const { data: diagnostic, error: diagError } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('id', proposal.diagnostic_id)
      .single();

    if (diagError || !diagnostic) {
      throw new NotFoundException('Diagnostic not found');
    }

    const tipo =
      dto.tipoNegocio ||
      (diagnostic.tipo_empresa as string) ||
      'generic';
    const tipoNorm =
      tipo === 'restaurante' ? 'restaurante' : tipo === 'taller' ? 'taller' : tipo === 'servicio-tecnico' ? 'servicio-tecnico' : 'generic';

    let html = await this.loadTemplate(tipoNorm);
    const variables = this.buildVariablesForTemplate(
      proposal as ProposalRow,
      diagnostic as Record<string, unknown>,
      dto,
    );
    const blocks = await this.getTemplateBlocks(tipoNorm);
    Object.assign(variables, blocks);
    const defaultLogoTu = await this.getDefaultLogoMaestroDataUrl();
    // Si el usuario no subió logo propio, usar siempre el del servidor (public/images/logo.png o SVG por defecto)
    variables.logoTu =
      dto.logoTu && String(dto.logoTu).startsWith('data:')
        ? dto.logoTu
        : defaultLogoTu;
    // Priorizar colores enviados desde el editor (modal); si no vienen o están vacíos, usar plantilla o default
    const hexLike = (s: string | undefined) => s && /^#?[0-9A-Fa-f]{3,8}$/.test(String(s).trim());
    variables.colorPrimary = (
      hexLike(dto.colorPrimary) ? dto.colorPrimary!.trim() : (blocks.color_primary || DEFAULT_COLOR_PRIMARY)
    ).trim();
    variables.colorSecondary = (
      hexLike(dto.colorSecondary) ? dto.colorSecondary!.trim() : (blocks.color_secondary || DEFAULT_COLOR_SECONDARY)
    ).trim();
    const qrImage = (blocks.qr_image || '').trim();
    variables.qr_html =
      qrImage && qrImage.startsWith('data:')
        ? `<img src="${qrImage.replace(/"/g, '&quot;').replace(/&/g, '&amp;')}" alt="QR WhatsApp" class="qr-image" />`
        : '<div class="qr-placeholder">QR WhatsApp</div>';
    html = this.injectVariables(html, variables);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await this.generatePdfFromHtml(html);
    } catch (err) {
      console.error('[proposal] generatePdfFromHtml failed:', err);
      throw new InternalServerErrorException('Error generating PDF');
    }

    await this.ensureBucketExists();

    const storagePath = `${STORAGE_PATH_PREFIX}/proposal_${proposalId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      throw new InternalServerErrorException(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    const pdfUrl = urlData?.publicUrl ?? null;

    const { data: updated, error: updateError } = await supabase
      .from('proposals')
      .update({ pdf_url: pdfUrl, status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .select()
      .single();

    if (updateError) {
      console.warn('[proposal] update pdf_url failed:', updateError.message);
      return proposal as ProposalRow;
    }

    const { error: leadUpdateError } = await supabase
      .from('leads')
      .update({
        proposal_id: proposalId,
        status: 'proposal_sent',
        updated_at: new Date().toISOString(),
      })
      .eq('diagnostic_id', proposal.diagnostic_id);
    if (leadUpdateError) {
      console.warn('[proposal] lead update (proposal_id) failed:', leadUpdateError.message);
    }

    return updated as ProposalRow;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

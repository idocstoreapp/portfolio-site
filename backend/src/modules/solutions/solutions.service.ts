import { Injectable } from '@nestjs/common';

@Injectable()
export class SolutionsService {
  getSolutions() {
    return {
      restaurantes: {
        id: 'restaurantes',
        title: 'Sistema para Restaurantes',
        description: 'Menú QR, POS y gestión completa.',
        icon: '🍽️',
        link: '/soluciones/restaurantes',
      },
      'servicio-tecnico': {
        id: 'servicio-tecnico',
        title: 'Sistema para Servicio Técnico',
        description: 'Gestiona reparaciones, inventario y clientes.',
        icon: '🔧',
        link: '/soluciones/servicio-tecnico',
      },
      'taller-mecanico': {
        id: 'taller-mecanico',
        title: 'Sistema para Taller Mecánico',
        description: 'Organiza reparaciones, repuestos y clientes.',
        icon: '🚗',
        link: '/soluciones/taller-mecanico',
      },
      'cotizador-fabrica': {
        id: 'cotizador-fabrica',
        title: 'Sistema Cotizador / Fábrica',
        description: 'Cotizaciones personalizadas con cálculo automático.',
        icon: '🏭',
        link: '/soluciones/cotizador-fabrica',
      },
      'desarrollo-web': {
        id: 'desarrollo-web',
        title: 'Desarrollo Web Profesional',
        description: 'Páginas web que convierten visitantes en clientes.',
        icon: '🌐',
        link: '/soluciones/desarrollo-web',
      },
    };
  }
}



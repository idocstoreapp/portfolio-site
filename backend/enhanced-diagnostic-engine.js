"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEnhancedDiagnostic = processEnhancedDiagnostic;
function getResultProfile(businessType) {
    const profiles = {
        'restaurante': {
            systemType: 'Sistema para Restaurantes',
            recommendedModules: ['POS', 'Menú Digital QR', 'Gestión de Mesas', 'Comandas Digitales', 'Control de Inventario'],
            applicableServices: ['Sistema para Restaurantes']
        },
        'servicio-tecnico': {
            systemType: 'Sistema para Servicio Técnico',
            recommendedModules: ['Gestión de Órdenes', 'Inventario de Repuestos', 'Cálculo de Comisiones', 'Comunicación con Clientes'],
            applicableServices: ['Sistema para Servicio Técnico']
        },
        'taller': {
            systemType: 'Sistema para Taller Mecánico',
            recommendedModules: ['Gestión de Órdenes', 'Inventario de Repuestos', 'Cálculo de Comisiones', 'Seguimiento de Reparaciones'],
            applicableServices: ['Sistema para Taller Mecánico']
        },
        'fabrica': {
            systemType: 'Sistema Cotizador / Fábrica',
            recommendedModules: ['Cotizaciones Automáticas', 'Cálculo de Costos', 'Control de Producción', 'Inventario de Materias Primas'],
            applicableServices: ['Sistema Cotizador / Fábrica']
        },
        'presencia-web': {
            systemType: 'Desarrollo Web Profesional',
            recommendedModules: ['Página Web', 'Ecommerce', 'Portfolio'],
            applicableServices: ['Desarrollo Web Profesional']
        },
        'comercio': {
            systemType: 'Sistema para Comercio',
            recommendedModules: ['Punto de Venta', 'Inventario', 'Ecommerce'],
            applicableServices: ['Sistema para Comercio']
        },
        'servicios': {
            systemType: 'Sistema para Servicios Profesionales',
            recommendedModules: ['Gestión de Proyectos', 'Cotizaciones', 'Portfolio'],
            applicableServices: ['Sistema para Servicios Profesionales']
        },
        'otro': {
            systemType: 'Sistema Personalizado',
            recommendedModules: ['Desarrollo Web', 'Sistema Administrativo', 'Ecommerce'],
            applicableServices: ['Desarrollo Web Profesional']
        }
    };
    return profiles[businessType] || profiles['otro'];
}
function generateOpportunityProfile(answers) {
    const painPoints = [];
    const benefits = [];
    const recommendations = [];
    if (answers.businessType === 'restaurante') {
        if (answers['tiene-pos'] === 'no-pos') {
            painPoints.push('No tienes un sistema POS, lo que dificulta el control de ventas');
            benefits.push('Implementar un sistema POS te dará control en tiempo real de todas las ventas');
            recommendations.push('Te recomendamos implementar un sistema POS integrado');
        }
        else if (answers['tiene-pos'] === 'pos-basico') {
            painPoints.push('Tu POS es básico y no gestiona mesas, comandas ni menús');
            benefits.push('Un POS completo gestiona mesas, comandas, menús y ventas desde un solo sistema');
            recommendations.push('Te recomendamos actualizar a un sistema POS completo');
        }
        if (answers['tiene-mesas-meseros'] === 'mesas-con-meseros') {
            if (answers['tiene-pos'] === 'no-pos' || answers['tiene-pos'] === 'pos-basico') {
                painPoints.push('Tienes meseros pero no tienes sistema para gestionar comandas y mesas');
                benefits.push('Un sistema de comandas digitales elimina errores y acelera el servicio');
                recommendations.push('Te recomendamos implementar un sistema de gestión de mesas y comandas');
            }
        }
        if (answers['menu-digital'] === 'solo-impreso') {
            painPoints.push('Tienes menú impreso, lo que genera costos cada vez que cambias precios o platos');
            benefits.push('Un menú digital con código QR se actualiza instantáneamente sin costo');
            recommendations.push('Te recomendamos actualizar tu menú digital con código QR');
        }
        else if (answers['menu-digital'] === 'ambos') {
            painPoints.push('Tienes menú impreso y digital, pero mantener ambos es costoso');
            benefits.push('Migrar completamente a menú digital elimina costos de impresión');
            recommendations.push('Te recomendamos migrar completamente a menú digital');
        }
        if (answers['como-recibe-pedidos']) {
            const pedidos = Array.isArray(answers['como-recibe-pedidos'])
                ? answers['como-recibe-pedidos']
                : [answers['como-recibe-pedidos']];
            if (pedidos.includes('delivery') || pedidos.includes('takeaway')) {
                if (!pedidos.includes('sistema-delivery')) {
                    painPoints.push('Recibes pedidos para delivery/takeaway pero no tienes sistema para gestionarlos');
                    benefits.push('Un sistema integrado gestiona pedidos de mesa, mostrador y delivery desde un solo lugar');
                    recommendations.push('Te recomendamos integrar la gestión de delivery y takeaway');
                }
            }
        }
        if (answers['control-inventario'] === 'no-inventario') {
            painPoints.push('No tienes control de inventario, lo que genera desperdicio y compras innecesarias');
            benefits.push('Control de inventario automático con alertas cuando se agotan ingredientes');
            recommendations.push('Te recomendamos automatizar tu control de inventario');
        }
        else if (answers['control-inventario'] === 'inventario-manual') {
            painPoints.push('Llevas inventario manual, lo que es lento y propenso a errores');
            benefits.push('Automatizar el inventario te ahorra tiempo y elimina errores');
            recommendations.push('Te recomendamos digitalizar tu control de inventario');
        }
        if (answers['problema-principal'] === 'pierdo-ordenes') {
            painPoints.push('Pierdes órdenes porque no tienes un sistema centralizado');
            benefits.push('Un sistema digital garantiza que ninguna orden se pierda');
        }
        else if (answers['problema-principal'] === 'tiempos-largos') {
            painPoints.push('Los clientes esperan mucho porque la cocina no sabe qué hacer');
            benefits.push('Comandas digitales llegan instantáneamente a la cocina');
        }
        else if (answers['problema-principal'] === 'sin-control-ventas') {
            painPoints.push('No sabes cuánto vendiste hasta que cierras la caja');
            benefits.push('Ves tus ventas en tiempo real desde cualquier dispositivo');
        }
        else if (answers['problema-principal'] === 'menus-caros') {
            painPoints.push('Cada cambio de menú te cuesta dinero en impresión');
            benefits.push('Menú digital se actualiza gratis e instantáneamente');
        }
        else if (answers['problema-principal'] === 'sin-inventario') {
            painPoints.push('No sabes qué ingredientes tienes hasta que te faltan');
            benefits.push('Control de inventario con alertas automáticas de stock bajo');
        }
    }
    if (answers.businessType === 'servicio-tecnico') {
        if (answers['tiene-sistema-administrativo'] === 'no-sistema' || answers['tiene-sistema-administrativo'] === 'excel') {
            painPoints.push('No tienes un sistema administrativo, gestionas todo en papel o Excel');
            benefits.push('Un sistema administrativo centraliza órdenes, clientes e inventario');
            recommendations.push('Te recomendamos implementar un sistema administrativo completo');
        }
        else if (answers['tiene-sistema-administrativo'] === 'sistema-basico') {
            painPoints.push('Tu sistema es básico y no cubre todas tus necesidades');
            benefits.push('Un sistema completo gestiona todo desde un solo lugar');
            recommendations.push('Te recomendamos actualizar a un sistema más completo');
        }
        if (answers['como-gestiona-ordenes'] === 'papel' || answers['como-gestiona-ordenes'] === 'whatsapp') {
            painPoints.push('Gestionas órdenes en papel o WhatsApp, lo que genera pérdida de información');
            benefits.push('Sistema digital de órdenes de servicio con seguimiento completo');
            recommendations.push('Te recomendamos digitalizar la gestión de órdenes de servicio');
        }
        if (answers['paga-comisiones'] === 'comisiones-manual') {
            painPoints.push('Calculas comisiones manualmente, lo que es lento y propenso a errores');
            benefits.push('Cálculo automático de comisiones por técnico y por trabajo');
            recommendations.push('Te recomendamos automatizar el cálculo de comisiones');
        }
        else if (answers['paga-comisiones'] === 'no-comisiones' && answers['tiene-sistema-administrativo'] !== 'sistema-completo') {
            benefits.push('Si en el futuro pagas comisiones, el sistema las calculará automáticamente');
        }
        if (answers['control-inventario-repuestos'] === 'no-inventario') {
            painPoints.push('No tienes control de repuestos, compras duplicados o te faltan los necesarios');
            benefits.push('Control de inventario de repuestos con alertas de stock bajo');
            recommendations.push('Te recomendamos implementar control de inventario de repuestos');
        }
        else if (answers['control-inventario-repuestos'] === 'inventario-manual') {
            painPoints.push('Llevas inventario manual, lo que es lento y propenso a errores');
            benefits.push('Inventario digital que se actualiza automáticamente con cada orden');
            recommendations.push('Te recomendamos digitalizar tu inventario de repuestos');
        }
        if (answers['como-cotiza'] === 'cotiza-manual' || answers['como-cotiza'] === 'cotiza-word') {
            painPoints.push('Cotizas a mano o en Word, lo que es lento y poco profesional');
            benefits.push('Generación automática de cotizaciones profesionales en minutos');
            recommendations.push('Te recomendamos automatizar la generación de cotizaciones');
        }
        if (answers['problema-principal'] === 'pierdo-ordenes') {
            painPoints.push('Pierdes órdenes de servicio porque no tienes un sistema centralizado');
            benefits.push('Sistema digital garantiza que ninguna orden se pierda');
        }
        else if (answers['problema-principal'] === 'sin-inventario') {
            painPoints.push('No sabes qué repuestos tienes hasta que los necesitas');
            benefits.push('Control de inventario con alertas automáticas');
        }
        else if (answers['problema-principal'] === 'clientes-preguntan') {
            painPoints.push('Los clientes preguntan constantemente porque no saben el estado de su reparación');
            benefits.push('Sistema de comunicación automática con clientes sobre el estado');
            recommendations.push('Te recomendamos implementar comunicación automática con clientes');
        }
        else if (answers['problema-principal'] === 'sin-control-financiero') {
            painPoints.push('No tienes control financiero, no sabes cuánto ganaste ni qué es rentable');
            benefits.push('Reportes financieros en tiempo real con análisis de rentabilidad');
            recommendations.push('Te recomendamos implementar reportes financieros automáticos');
        }
        else if (answers['problema-principal'] === 'comisiones-complicadas') {
            painPoints.push('Calcular comisiones manualmente es complicado y toma mucho tiempo');
            benefits.push('Cálculo automático de comisiones por técnico y por trabajo');
            recommendations.push('Te recomendamos automatizar el cálculo de comisiones');
        }
    }
    if (answers.businessType === 'taller') {
        if (answers['tiene-sistema-administrativo'] === 'no-sistema' || answers['tiene-sistema-administrativo'] === 'excel') {
            painPoints.push('No tienes un sistema administrativo, gestionas todo en papel o Excel');
            benefits.push('Un sistema administrativo centraliza órdenes, clientes e inventario');
            recommendations.push('Te recomendamos implementar un sistema administrativo para talleres');
        }
        if (answers['paga-comisiones'] === 'comisiones-manual') {
            painPoints.push('Calculas comisiones de mecánicos manualmente');
            benefits.push('Cálculo automático de comisiones por mecánico');
            recommendations.push('Te recomendamos automatizar el cálculo de comisiones de mecánicos');
        }
        if (answers['control-inventario-repuestos'] === 'no-inventario') {
            painPoints.push('No tienes control de repuestos de autos/motos');
            benefits.push('Control de inventario específico para repuestos automotrices');
            recommendations.push('Te recomendamos implementar control de inventario de repuestos');
        }
    }
    if (answers.businessType === 'fabrica') {
        if (answers['hace-cotizaciones'] === 'si-cotizo') {
            if (answers['como-cotiza'] === 'cotiza-manual' || answers['como-cotiza'] === 'cotiza-excel') {
                painPoints.push('Cotizas manualmente o en Excel, lo que es lento y propenso a errores');
                benefits.push('Sistema de cotizaciones automáticas con cálculo de costos en minutos');
                recommendations.push('Te recomendamos implementar un sistema de cotizaciones automáticas');
            }
        }
        if (answers['como-calcula-costos'] === 'costos-manual' || answers['como-calcula-costos'] === 'costos-aproximados') {
            painPoints.push('Calculas costos manualmente o usas aproximaciones, lo que genera errores');
            benefits.push('Cálculo automático de costos reales basado en materias primas y mano de obra');
            recommendations.push('Te recomendamos automatizar el cálculo de costos reales');
        }
        else if (answers['como-calcula-costos'] === 'costos-excel') {
            painPoints.push('Calculas costos en Excel, lo que es propenso a errores y difícil de mantener');
            benefits.push('Sistema que calcula costos automáticamente y se actualiza en tiempo real');
            recommendations.push('Te recomendamos migrar a un sistema de cálculo de costos automatizado');
        }
        if (answers['control-produccion'] === 'no-control') {
            painPoints.push('No tienes control de producción, no sabes qué está en proceso');
            benefits.push('Control de producción con seguimiento de estado de cada orden');
            recommendations.push('Te recomendamos implementar control de producción');
        }
        else if (answers['control-produccion'] === 'control-manual') {
            painPoints.push('Llevas control de producción manual, lo que es lento y propenso a errores');
            benefits.push('Sistema digital de control de producción con actualizaciones en tiempo real');
            recommendations.push('Te recomendamos digitalizar el control de producción');
        }
        if (answers['control-materias-primas'] === 'no-inventario') {
            painPoints.push('No tienes control de materias primas, compras sin saber qué tienes');
            benefits.push('Control de inventario de materias primas con alertas de stock bajo');
            recommendations.push('Te recomendamos implementar control de inventario de materias primas');
        }
        if (answers['problema-principal'] === 'cotizaciones-lentas') {
            painPoints.push('Las cotizaciones toman mucho tiempo porque calculas a mano');
            benefits.push('Cotizaciones profesionales generadas en minutos');
        }
        else if (answers['problema-principal'] === 'errores-calculo') {
            painPoints.push('Cometes errores en los cálculos de costos y precios');
            benefits.push('Cálculos automáticos sin errores');
        }
        else if (answers['problema-principal'] === 'sin-control-costos') {
            painPoints.push('No sabes cuánto cuesta realmente producir cada producto');
            benefits.push('Cálculo automático de costos reales de producción');
        }
        else if (answers['problema-principal'] === 'sin-catalogo') {
            painPoints.push('No tienes catálogo online, los clientes no pueden ver tus productos');
            benefits.push('Catálogo digital accesible 24/7 con cotizador integrado');
            recommendations.push('Te recomendamos crear un catálogo online con cotizador');
        }
    }
    if (answers.businessType === 'presencia-web') {
        if (answers['situacion-actual'] === 'sin-web') {
            painPoints.push('No tienes página web, los clientes no te encuentran en internet');
            benefits.push('Presencia profesional en internet que convierte visitantes en clientes');
            recommendations.push('Te recomendamos crear una página web profesional');
        }
        else if (answers['situacion-actual'] === 'web-desactualizada') {
            painPoints.push('Tu página web está desactualizada y no funciona bien');
            benefits.push('Página web moderna, rápida y optimizada para conversión');
            recommendations.push('Te recomendamos modernizar tu página web');
        }
        else if (answers['situacion-actual'] === 'solo-redes') {
            painPoints.push('Solo tienes redes sociales, no tienes presencia profesional');
            benefits.push('Página web profesional que complementa tus redes sociales');
            recommendations.push('Te recomendamos crear una página web profesional');
        }
        if (answers['objetivo-principal']?.includes('vender-online')) {
            painPoints.push('Quieres vender online pero no tienes tienda virtual');
            benefits.push('Tienda online (ecommerce) que permite vender 24/7');
            recommendations.push('Te recomendamos implementar una tienda online');
        }
        if (answers['objetivo-principal']?.includes('mostrar-trabajos')) {
            painPoints.push('Quieres mostrar tus trabajos pero no tienes portfolio online');
            benefits.push('Portfolio digital profesional que muestra tus mejores trabajos');
            recommendations.push('Te recomendamos crear un portfolio digital');
        }
    }
    let title = 'Oportunidad de Transformación Digital';
    let description = 'Basado en tu diagnóstico específico, hemos identificado oportunidades precisas para tu negocio.';
    if (answers.businessType === 'restaurante') {
        title = 'Oportunidad: Digitalizar tu Restaurante';
        description = 'Tu restaurante puede operar completamente digital, eliminando pérdidas de órdenes, reduciendo costos de menús y mejorando la experiencia del cliente.';
    }
    else if (answers.businessType === 'servicio-tecnico' || answers.businessType === 'taller') {
        title = 'Oportunidad: Organización Profesional';
        description = 'Puedes tener control total de tus reparaciones, inventario, comisiones y clientes desde un solo sistema integrado.';
    }
    else if (answers.businessType === 'fabrica') {
        title = 'Oportunidad: Cotizaciones Inteligentes';
        description = 'Puedes generar cotizaciones profesionales en minutos con cálculo automático de costos reales y control de producción.';
    }
    else if (answers.businessType === 'presencia-web') {
        title = 'Oportunidad: Presencia Digital Profesional';
        description = 'Puedes tener una presencia profesional en internet que convierta visitantes en clientes y aumente tus ventas.';
    }
    return {
        title,
        description,
        painPoints: painPoints.length > 0 ? painPoints : ['Falta de organización y control'],
        benefits: benefits.length > 0 ? benefits : ['Mejora en eficiencia y productividad']
    };
}
function generateRecommendation(answers) {
    const primarySolution = {
        title: '',
        description: '',
        icon: '',
        link: '',
        matchScore: 100,
        reason: ''
    };
    switch (answers.businessType) {
        case 'restaurante':
            primarySolution.title = 'Sistema para Restaurantes';
            primarySolution.description = 'Menú QR, POS, gestión de mesas y comandas. Deja el papel atrás.';
            primarySolution.icon = '🍽️';
            primarySolution.link = '/soluciones/restaurantes';
            if (answers['tiene-pos'] === 'no-pos') {
                primarySolution.reason = 'No tienes un sistema POS. Te recomendamos implementar un sistema POS completo que gestione ventas, mesas y comandas.';
            }
            else if (answers['menu-digital'] === 'solo-impreso') {
                primarySolution.reason = 'Tienes menú impreso. Te recomendamos actualizar a menú digital con código QR que se actualiza instantáneamente sin costo.';
            }
            else if (answers['tiene-mesas-meseros'] === 'mesas-con-meseros' && (answers['tiene-pos'] === 'no-pos' || answers['tiene-pos'] === 'pos-basico')) {
                primarySolution.reason = 'Tienes meseros pero no tienes sistema para gestionar comandas. Te recomendamos implementar un sistema de gestión de mesas y comandas digitales.';
            }
            else {
                primarySolution.reason = 'Tu restaurante necesita un sistema específico que gestione menús digitales, POS, comandas y mesas de forma integrada.';
            }
            break;
        case 'servicio-tecnico':
            primarySolution.title = 'Sistema para Servicio Técnico';
            primarySolution.description = 'Gestiona reparaciones, inventario, comisiones y clientes desde un solo sistema.';
            primarySolution.icon = '🔧';
            primarySolution.link = '/soluciones/servicio-tecnico';
            if (answers['tiene-sistema-administrativo'] === 'no-sistema' || answers['tiene-sistema-administrativo'] === 'excel') {
                primarySolution.reason = 'No tienes un sistema administrativo. Te recomendamos implementar un sistema completo que gestione órdenes de servicio, inventario y clientes.';
            }
            else if (answers['paga-comisiones'] === 'comisiones-manual') {
                primarySolution.reason = 'Calculas comisiones manualmente. Te recomendamos automatizar el cálculo de comisiones por técnico y por trabajo.';
            }
            else if (answers['control-inventario-repuestos'] === 'no-inventario') {
                primarySolution.reason = 'No tienes control de inventario de repuestos. Te recomendamos implementar un sistema que controle tu inventario automáticamente.';
            }
            else {
                primarySolution.reason = 'Necesitas un sistema especializado para gestionar órdenes de servicio, repuestos, comisiones y comunicación con clientes.';
            }
            break;
        case 'taller':
            primarySolution.title = 'Sistema para Taller Mecánico';
            primarySolution.description = 'Organiza reparaciones, repuestos, comisiones y clientes de forma profesional.';
            primarySolution.icon = '🚗';
            primarySolution.link = '/soluciones/taller-mecanico';
            primarySolution.reason = 'Tu taller necesita un sistema que gestione órdenes de servicio, inventario de repuestos, comisiones de mecánicos y seguimiento de reparaciones.';
            break;
        case 'fabrica':
            primarySolution.title = 'Sistema Cotizador / Fábrica';
            primarySolution.description = 'Cotizaciones personalizadas con cálculo automático de costos reales.';
            primarySolution.icon = '🏭';
            primarySolution.link = '/soluciones/cotizador-fabrica';
            if (answers['como-cotiza'] === 'cotiza-manual' || answers['como-cotiza'] === 'cotiza-excel') {
                primarySolution.reason = 'Cotizas manualmente o en Excel. Te recomendamos implementar un sistema que genere cotizaciones profesionales automáticamente en minutos.';
            }
            else if (answers['como-calcula-costos'] === 'costos-manual' || answers['como-calcula-costos'] === 'costos-aproximados') {
                primarySolution.reason = 'Calculas costos manualmente o usas aproximaciones. Te recomendamos automatizar el cálculo de costos reales basado en materias primas y mano de obra.';
            }
            else {
                primarySolution.reason = 'Requieres un sistema que calcule costos reales y genere cotizaciones profesionales automáticamente.';
            }
            break;
        case 'presencia-web':
            primarySolution.title = 'Desarrollo Web Profesional';
            primarySolution.description = 'Páginas web que convierten visitantes en clientes.';
            primarySolution.icon = '🌐';
            primarySolution.link = '/soluciones/desarrollo-web';
            if (answers['situacion-actual'] === 'sin-web') {
                primarySolution.reason = 'No tienes página web. Te recomendamos crear una presencia profesional en internet para que los clientes te encuentren.';
            }
            else if (answers['situacion-actual'] === 'web-desactualizada') {
                primarySolution.reason = 'Tu página web está desactualizada. Te recomendamos modernizarla para mejorar la experiencia de tus clientes.';
            }
            else {
                primarySolution.reason = 'Necesitas una presencia profesional en internet que convierta visitantes en clientes.';
            }
            break;
    }
    const complementarySolutions = [];
    if (answers.businessType !== 'presencia-web') {
        if (answers['situacion-actual'] === 'sin-web' ||
            answers['nivel-digital'] === 'nada' ||
            answers['situacion-actual'] === 'solo-redes') {
            complementarySolutions.push({
                title: 'Desarrollo Web Profesional',
                description: 'Complementa tu sistema con una presencia profesional en internet.',
                icon: '🌐',
                link: '/soluciones/desarrollo-web',
                reason: 'Una página web profesional complementa cualquier sistema interno y ayuda a conseguir más clientes.'
            });
        }
    }
    return {
        primarySolution,
        complementarySolutions
    };
}
function generatePersonalizedMessage(answers, opportunity) {
    const insights = [];
    if (answers.businessType === 'restaurante') {
        if (answers['tiene-pos'] === 'no-pos') {
            insights.push('No tienes un sistema POS, lo que significa que no tienes control en tiempo real de tus ventas. Implementar un POS te dará visibilidad completa de tu negocio.');
        }
        if (answers['menu-digital'] === 'solo-impreso') {
            insights.push('Tienes menú impreso, lo que genera costos cada vez que cambias precios o agregas platos. Un menú digital con código QR se actualiza instantáneamente sin costo.');
        }
        if (answers['control-inventario'] === 'no-inventario') {
            insights.push('No tienes control de inventario, lo que genera desperdicio y compras innecesarias. Automatizar el inventario te ahorrará dinero y tiempo.');
        }
        if (answers['problema-principal'] === 'pierdo-ordenes') {
            insights.push('La pérdida de órdenes es un problema crítico que afecta directamente tus ingresos. Un sistema digital elimina este problema completamente.');
        }
    }
    else if (answers.businessType === 'servicio-tecnico' || answers.businessType === 'taller') {
        if (answers['tiene-sistema-administrativo'] === 'no-sistema' || answers['tiene-sistema-administrativo'] === 'excel') {
            insights.push('Gestionas todo en papel o Excel, lo que significa que estás perdiendo información y tiempo. Un sistema digital centraliza todo y te ahorra horas de trabajo diarias.');
        }
        if (answers['paga-comisiones'] === 'comisiones-manual') {
            insights.push('Calculas comisiones manualmente, lo que es lento y propenso a errores. Automatizar el cálculo de comisiones te libera tiempo y elimina errores.');
        }
        if (answers['control-inventario-repuestos'] === 'no-inventario') {
            insights.push('No tienes control de repuestos, lo que genera compras duplicadas o faltantes. Un sistema de inventario te ahorrará dinero y tiempo.');
        }
    }
    else if (answers.businessType === 'fabrica') {
        if (answers['como-cotiza'] === 'cotiza-manual' || answers['como-cotiza'] === 'cotiza-excel') {
            insights.push('Cotizas manualmente o en Excel, lo que es lento y propenso a errores. Un sistema de cotizaciones automáticas genera presupuestos profesionales en minutos.');
        }
        if (answers['como-calcula-costos'] === 'costos-manual' || answers['como-calcula-costos'] === 'costos-aproximados') {
            insights.push('Calculas costos manualmente o usas aproximaciones, lo que genera errores y pérdidas. Un sistema calcula costos reales automáticamente basado en materias primas y mano de obra.');
        }
    }
    else if (answers.businessType === 'presencia-web') {
        if (answers['situacion-actual'] === 'sin-web') {
            insights.push('No tienes página web, lo que significa que los clientes no te encuentran en internet. Una presencia profesional en internet es esencial para cualquier negocio moderno.');
        }
        else if (answers['situacion-actual'] === 'web-desactualizada') {
            insights.push('Tu página web está desactualizada, lo que afecta la confianza de tus clientes. Modernizar tu web mejorará tu imagen y aumentará tus conversiones.');
        }
    }
    const insight = insights.length > 0
        ? insights.join(' ')
        : 'Basado en tus respuestas específicas, tenemos una solución diseñada para tu tipo de negocio.';
    return {
        title: `Hemos analizado tu negocio y encontrado oportunidades específicas`,
        subtitle: `Tu diagnóstico revela áreas clave donde la tecnología puede transformar tu operación.`,
        insight
    };
}
function calculateUrgency(answers) {
    if (answers.businessType === 'restaurante') {
        if (answers['tiene-pos'] === 'no-pos' &&
            (answers['problema-principal'] === 'pierdo-ordenes' ||
                answers['problema-principal'] === 'sin-control-ventas')) {
            return 'high';
        }
    }
    else if (answers.businessType === 'servicio-tecnico' || answers.businessType === 'taller') {
        if ((answers['tiene-sistema-administrativo'] === 'no-sistema' || answers['tiene-sistema-administrativo'] === 'excel') &&
            (answers['problema-principal'] === 'pierdo-ordenes' ||
                answers['problema-principal'] === 'sin-control-financiero')) {
            return 'high';
        }
    }
    else if (answers.businessType === 'fabrica') {
        if ((answers['como-cotiza'] === 'cotiza-manual' || answers['como-cotiza'] === 'cotiza-excel') &&
            answers['problema-principal'] === 'cotizaciones-lentas') {
            return 'high';
        }
    }
    else if (answers.businessType === 'presencia-web') {
        if (answers['situacion-actual'] === 'sin-web' &&
            answers['objetivo-principal']?.some(obj => obj.includes('vender') || obj.includes('presencia'))) {
            return 'high';
        }
    }
    if (answers.businessType === 'restaurante' && answers['tiene-pos'] === 'pos-basico') {
        return 'medium';
    }
    if ((answers.businessType === 'servicio-tecnico' || answers.businessType === 'taller') &&
        answers['tiene-sistema-administrativo'] === 'sistema-basico') {
        return 'medium';
    }
    return 'low';
}
function processEnhancedDiagnostic(answers) {
    const opportunity = generateOpportunityProfile(answers);
    const recommendation = generateRecommendation(answers);
    const personalizedMessage = generatePersonalizedMessage(answers, opportunity);
    const urgency = calculateUrgency(answers);
    const resultProfile = getResultProfile(answers.businessType);
    const id = `temp-${Date.now()}`;
    return {
        id,
        businessType: answers.businessType,
        resultProfile,
        opportunity,
        recommendation,
        personalizedMessage,
        urgency,
        nextSteps: {
            primary: {
                text: `Solicitar validación operativa`,
                link: `${recommendation.primarySolution.link}?from=diagnostico&highlight=${recommendation.primarySolution.matchScore}`
            },
            secondary: recommendation.complementarySolutions.length > 0 ? {
                text: 'Ver soluciones complementarias',
                link: '/soluciones'
            } : undefined
        }
    };
}
//# sourceMappingURL=enhanced-diagnostic-engine.js.map
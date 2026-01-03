import type { APIRoute } from 'astro';
import { processDiagnostic, normalizeAnswers } from '../../utils/diagnosticEngine';
import { saveDiagnostic } from '../../utils/supabaseClient';

// Aceptar tanto GET como POST
export const GET: APIRoute = async ({ url, request }) => {
  console.log('=== GET HANDLER ===');
  console.log('Request URL:', request?.url);
  console.log('Context URL:', url.href);
  console.log('Context URL search:', url.search);
  console.log('Context URL searchParams:', Array.from(url.searchParams.entries()));
  return handleRequest(url, request, null);
};

export const POST: APIRoute = async ({ request, url }) => {
  console.log('=== POST HANDLER ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request bodyUsed:', request.bodyUsed);
  console.log('Request body:', request.body);
  console.log('Content-Type:', request.headers.get('content-type'));
  console.log('Content-Length:', request.headers.get('content-length'));
  console.log('All headers:', Object.fromEntries(request.headers.entries()));
  
  // Verificar si el body está disponible
  if (request.body === null) {
    console.error('Request.body is null - this is the problem!');
    return new Response(
      JSON.stringify({
        error: 'Request body is null',
        bodyUsed: request.bodyUsed,
        contentType: request.headers.get('content-type'),
        contentLength: request.headers.get('content-length'),
        url: request.url
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Leer el body directamente aquí
  let body: any = null;
  
  try {
    // Clonar el request para poder leer el body sin consumirlo
    const clonedRequest = request.clone();
    
    // Intentar leer como texto primero para ver qué hay
    const bodyText = await clonedRequest.text();
    console.log('Body as text (raw):', bodyText);
    console.log('Body text length:', bodyText?.length || 0);
    console.log('Body text type:', typeof bodyText);
    
    if (!bodyText || bodyText.trim().length === 0) {
      console.error('Body text is empty or whitespace');
      return new Response(
        JSON.stringify({
          error: 'POST body is empty',
          bodyText: bodyText || '(null)',
          bodyLength: bodyText?.length || 0,
          bodyUsed: request.bodyUsed,
          contentType: request.headers.get('content-type'),
          contentLength: request.headers.get('content-length')
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parsear el JSON
    try {
      body = JSON.parse(bodyText);
      console.log('Body parsed successfully:', body);
      console.log('Body keys:', Object.keys(body || {}));
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Body text that failed:', bodyText.substring(0, 200));
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in POST body',
          message: (parseError as Error).message,
          bodyText: bodyText.substring(0, 200)
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error reading body:', error);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    return new Response(
      JSON.stringify({
        error: 'Error reading request body',
        message: (error as Error).message,
        stack: (error as Error).stack
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Pasar el body ya leído a handleRequest
  return handleRequest(url, request, body);
};

async function handleRequest(url: URL, request: Request, body: any) {
  try {
    console.log('=== API DIAGNOSTICO ===');
    console.log('Request URL:', request?.url);
    console.log('Request method:', request?.method);
    console.log('URL object href:', url.href);
    console.log('URL object search:', url.search);
    
    let rawAnswers: Record<number, string | string[]> = {};
    let contactName = '';
    let contactCompany = '';
    
    if (request.method === 'POST') {
      // Usar el body que ya fue leído
      if (!body) {
        console.error('Body is null or undefined');
        return new Response(
          JSON.stringify({
            error: 'Request body is null',
            bodyUsed: request.bodyUsed,
            contentType: request.headers.get('content-type'),
            contentLength: request.headers.get('content-length')
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log('Processing POST body:', body);
      console.log('Body type:', typeof body);
      console.log('Body keys:', Object.keys(body));
      
      // Procesar cada step del body directamente
      for (let i = 1; i <= 6; i++) {
        const paramName = `step${i}`;
        const value = body[paramName];
        
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            rawAnswers[i] = value;
            console.log(`${paramName} -> array:`, value);
          } else {
            rawAnswers[i] = String(value);
            console.log(`${paramName} -> string:`, value);
          }
        }
      }
      
      // Obtener información de contacto del body
      contactName = body.name ? String(body.name) : '';
      contactCompany = body.company ? String(body.company) : '';
      
      console.log('Raw answers from POST body:', rawAnswers);
      console.log('Raw answers keys:', Object.keys(rawAnswers));
      console.log('Contact info:', { name: contactName, company: contactCompany });
      
    } else {
      // Para GET, usar la URL del request para obtener los query parameters reales
      let searchParams: URLSearchParams;
      
      // Intentar obtener los parámetros del request URL primero
      if (request?.url) {
        const requestUrl = new URL(request.url);
        searchParams = requestUrl.searchParams;
        console.log('Using request URL for GET');
        console.log('Request URL completa:', request.url);
        console.log('Request URL search:', requestUrl.search);
      } else if (url.search && url.search.length > 0) {
        searchParams = url.searchParams;
        console.log('Using context URL for GET');
        console.log('Context URL search:', url.search);
      } else {
        searchParams = url.searchParams;
        console.log('Using fallback URL for GET');
      }
      
      console.log('Search params entries:', Array.from(searchParams.entries()));
      console.log('Search params toString:', searchParams.toString());
      
      for (let i = 1; i <= 6; i++) {
        const paramName = `step${i}`;
        const value = searchParams.get(paramName);
        
        console.log(`Checking ${paramName}:`, value);
        
        if (value) {
          const decodedValue = decodeURIComponent(value);
          console.log(`${paramName} decoded:`, decodedValue);
          
          if (decodedValue.includes(',')) {
            rawAnswers[i] = decodedValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
            console.log(`${paramName} -> array:`, rawAnswers[i]);
          } else {
            rawAnswers[i] = decodedValue.trim();
            console.log(`${paramName} -> string:`, rawAnswers[i]);
          }
        }
      }
      
      contactName = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : '';
      contactCompany = searchParams.get('company') ? decodeURIComponent(searchParams.get('company')!) : '';
      
      console.log('Contact info from GET:', { name: contactName, company: contactCompany });
    }
    
    // Verificar que tenemos respuestas mínimas
    if (Object.keys(rawAnswers).length === 0) {
      console.error('No answers found!');
      return new Response(
        JSON.stringify({
          error: 'No se encontraron respuestas',
          rawAnswers,
          method: request.method,
          urlHref: url.href,
          urlSearch: url.search
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Procesar diagnóstico
    console.log('Normalizing answers...');
    const normalizedAnswers = normalizeAnswers(rawAnswers);
    console.log('Normalized answers:', normalizedAnswers);
    
    console.log('Processing diagnostic...');
    const result = processDiagnostic(normalizedAnswers);
    console.log('Result generated:', result);
    
    // Guardar diagnóstico en Supabase (si está configurado)
    if (result) {
      try {
        await saveDiagnostic({
          tipo_empresa: normalizedAnswers.tipoEmpresa,
          nivel_digital: normalizedAnswers.nivelDigital,
          objetivos: normalizedAnswers.objetivos,
          tamano: normalizedAnswers.tamano,
          necesidades_adicionales: normalizedAnswers.necesidadesAdicionales,
          nombre: contactName || undefined,
          empresa: contactCompany || undefined,
          solucion_principal: result.primarySolution.id,
          soluciones_complementarias: result.complementarySolutions.map(s => s.id),
          urgencia: result.urgency,
        });
        console.log('Diagnóstico guardado en Supabase');
      } catch (dbError) {
        // No fallar si no se puede guardar, solo loguear
        console.warn('No se pudo guardar en Supabase (puede que no esté configurado):', dbError);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        result,
        contactInfo: {
          name: contactName,
          company: contactCompany
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing diagnostic:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al procesar el diagnóstico',
        message: (error as Error).message,
        stack: (error as Error).stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

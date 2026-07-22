import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import nodemailer from 'https://esm.sh/nodemailer@6.9.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS para solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nombre, empresa, telefono, email, mensaje } = await req.json()

    // 1. Validación básica
    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({ error: 'Nombre, email y mensaje son obligatorios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Obtener credenciales desde los Secrets de Supabase (NUNCA en el código)
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Number(Deno.env.get('SMTP_PORT'))
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')
    const smtpFrom = Deno.env.get('SMTP_FROM') || 'ventas@correascenter.com'

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('Faltan variables de entorno SMTP en Supabase Secrets')
    }

    // 3. Configurar el transportador de correo
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true para 465, false para 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // 4. Crear el contenido del correo
    const mailOptions = {
      from: `"Correas Center Web" <${smtpFrom}>`,
      to: 'ventas@correascenter.com, luis.gallegos@correascenter.com', // Destinatarios
      subject: `Nuevo Mensaje de Contacto: ${nombre}`,
      html: `
        <h2>Nuevo mensaje desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Empresa:</strong> ${empresa || 'No especificada'}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No especificado'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">${mensaje}</p>
      `,
    }

    // 5. Enviar el correo
    const info = await transporter.sendMail(mailOptions)

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en Edge Function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
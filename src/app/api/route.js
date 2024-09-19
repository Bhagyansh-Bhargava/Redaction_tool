// export default function handler(req, res) {
//     const allowedIPs = ['110.224.64.18', '122.15.204.67'];
  
//     // Get the client's IP address from the x-forwarded-for header
//     const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
  
//     // Check if the client IP is in the list of allowed IPs
//     if (!allowedIPs.includes(clientIP)) {
//       return res.status(403).json({ message: 'Access Forbidden: Your IP is not whitelisted.' });
//     }
  
//     // If the IP is allowed, return success
//     res.status(200).json({ message: 'Access granted!' });
//   }
  



// export async function GET(req) {
//   const allowedIPs = ['110.224.64.18', '122.15.204.67', '192.168.137.75', '192.168.195.235', '223.187.108.160'];

//   // Get the client's IP address from headers
//   const forwarded = req.headers.get('x-forwarded-for');
//   const clientIP = forwarded ? forwarded.split(',')[0] : req.ip;

//   // Check if the client IP is in the list of allowed IPs
//   if (!allowedIPs.includes(clientIP)) {
//     return new Response(JSON.stringify({ message: 'Access Forbidden: Your IP is not whitelisted.' }), { status: 403 });
//   }

//   // If the IP is allowed, return success
//   return new Response(JSON.stringify({ message: 'Access granted!' }), { status: 200 });
// }


// export async function GET(req) {
//   // const allowedIPs = ['110.224.64.18', '122.15.204.67'];
//   const allowedIPs = ['110.224.64.18', '122.15.204.67', '192.168.137.75', '192.168.195.235', '223.187.108.160'];


//   // Get the client's IP address from headers
//   const forwarded = req.headers.get('x-forwarded-for');
//   const clientIP = forwarded ? forwarded.split('.')[0].trim() : req.ip;

//   let ipMatched = false;

//   // Loop through the allowed IPs and check for a match
//   for (let i = 0; i < allowedIPs.length; i++) {
//     if (allowedIPs[i] === clientIP) {
//       ipMatched = true;
//       break;
//     }
//   }

//   if (!ipMatched) {
//     return new Response(JSON.stringify({
//       message: `Access Forbidden: Your IP (${clientIP}) is not whitelisted.`,
//     }), { status: 403 });
//   }

//   return new Response(JSON.stringify({ message: 'Access granted!' }), { status: 200 });
// }


export async function GET(req) {
  const allowedIPs = ['110.224.64.18', '122.15.204.67', '192.168.137.75', '192.168.195.235', '223.187.108.160'];

  // Get the client's IP address
  let clientIP = req.headers.get('x-forwarded-for') || req.ip;
  console.log(clientIP)
  
  // If x-forwarded-for contains multiple IPs, take the first one
  if (clientIP.includes(',')) {
    clientIP = clientIP.split(',')[0].trim();
  }

  // Check if the client IP is in the allowed list
  const ipMatched = allowedIPs.includes(clientIP);

  if (!ipMatched) {
    return new Response(JSON.stringify({
      message: `Access Forbidden: Your IP (${clientIP}) is not whitelisted.`,
    }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    message: 'Access granted!',
    clientIP: clientIP
  }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
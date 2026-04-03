/**
 * IPFS Upload Service
 * 
 * Provides functions to upload files and metadata to IPFS via Pinata
 * 
 * Configuration:
 * - NEXT_PUBLIC_PINATA_API_KEY: Your Pinata API key
 * - NEXT_PUBLIC_PINATA_SECRET_KEY: Your Pinata secret key
 * - NEXT_PUBLIC_PINATA_JWT: Your Pinata JWT token (recommended)
 */

const PINATA_API_URL = 'https://api.pinata.cloud/pinning';

/**
 * Upload a file to Pinata IPFS
 * 
 * @param file - The file to upload
 * @returns IPFS URL (ipfs://...) or HTTP gateway URL
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!jwt && (!apiKey || !secretKey)) {
    throw new Error(
      'Pinata credentials not configured. Please set NEXT_PUBLIC_PINATA_JWT or both NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY in your .env.local'
    );
  }

  const formData = new FormData();
  formData.append('file', file);

  // Add metadata for the file
  const pinataMetadata = {
    name: file.name,
  };
  formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

  // Build headers
  const headers: HeadersInit = {};
  
  if (jwt) {
    // Using JWT (recommended)
    headers['Authorization'] = `Bearer ${jwt}`;
  } else {
    // Using API key + secret (legacy method)
    headers['pinata_api_key'] = apiKey!;
    headers['pinata_secret_api_key'] = secretKey!;
  }

  try {
    const response = await fetch(`${PINATA_API_URL}/pinFileToIPFS`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload to IPFS');
    }

    const data = await response.json();
    
    // Return IPFS URL format
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Upload JSON metadata to Pinata IPFS
 * 
 * @param metadata - The metadata object to upload
 * @returns IPFS URL (ipfs://...)
 */
export async function uploadMetadataToIPFS(metadata: Record<string, any>): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

  if (!jwt && (!apiKey || !secretKey)) {
    throw new Error(
      'Pinata credentials not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env.local'
    );
  }

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  } else {
    headers['pinata_api_key'] = apiKey!;
    headers['pinata_secret_api_key'] = secretKey!;
  }

  try {
    const response = await fetch(`${PINATA_API_URL}/pinJSONToIPFS`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pinataMetadata: {
          name: metadata.name || 'NFT Metadata',
        },
        pinataContent: metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload metadata to IPFS');
    }

    const data = await response.json();
    
    // Return IPFS URL format
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Convert IPFS URL to HTTP gateway URL
 * 
 * @param ipfsUrl - IPFS URL (ipfs://...)
 * @param gateway - Custom gateway URL (default: pinata.cloud)
 * @returns HTTP URL that can be used in <img> tags
 */
export function ipfsToHttpUrl(ipfsUrl: string, gateway: string = 'https://gateway.pinata.cloud'): string {
  if (!ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl; // Already an HTTP URL
  }
  
  const hash = ipfsUrl.replace('ipfs://', '');
  return `${gateway}/ipfs/${hash}`;
}

/**
 * Get Pinata JWT from API key and secret (for backend use)
 * 
 * This should be done server-side for security
 */
export async function getPinataJWT(apiKey: string, secretKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/users/generateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate JWT token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
}

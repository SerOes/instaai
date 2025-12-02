# Seedream V4 API (ByteDance)

offiziellle Doku:
https://kie.ai/seedream-api


## Übersicht
- **Anbieter**: ByteDance via KIE.ai
- **Typ**: Text-to-Image, Image Editing
- **Pricing**: 3.5 credits pro Bild (~$0.0175) - unabhängig von Auflösung

## Verfügbare Modelle

### 1. Seedream V4 Edit
- **Modell-ID**: `bytedance/seedream-v4-edit`
- **Typ**: Image Editing (benötigt Eingabebild)

### 2. Seedream V4 Text-to-Image
- **Modell-ID**: `bytedance/seedream-v4-text-to-image`
- **Typ**: Text-to-Image

## API Endpoints
```
POST https://api.kie.ai/api/v1/seedream-v4-edit/generate
POST https://api.kie.ai/api/v1/seedream-v4-text-to-image/generate

GET https://api.kie.ai/api/v1/seedream-v4-{type}/record-info?taskId={taskId}
```

## Request Parameter

### Seedream V4 Edit
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `prompt` | string | ✅ | Text-Beschreibung der Bearbeitung |
| `image_urls` | array | ✅ | Eingabebilder (bis zu 10) |
| `image_size` | string | ❌ | Größe/Seitenverhältnis |
| `image_resolution` | string | ❌ | Auflösung: 1K, 2K, 4K |
| `max_images` | number | ❌ | Anzahl der Ausgabebilder (1-6) |
| `seed` | number | ❌ | Seed für Reproduzierbarkeit |

### Seedream V4 Text-to-Image
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `prompt` | string | ✅ | Text-Beschreibung |
| `image_size` | string | ❌ | Größe/Seitenverhältnis |
| `image_resolution` | string | ❌ | Auflösung: 1K, 2K, 4K |
| `max_images` | number | ❌ | Anzahl der Ausgabebilder (1-6) |
| `seed` | number | ❌ | Seed für Reproduzierbarkeit |

## Unterstützte Image Sizes
- `square` - Quadrat
- `square_hd` - Quadrat HD
- `portrait_4_3` - Portrait 4:3
- `portrait_3_2` - Portrait 3:2
- `portrait_16_9` - Portrait 16:9 (eigentlich 9:16)
- `landscape_4_3` - Landscape 4:3
- `landscape_3_2` - Landscape 3:2
- `landscape_16_9` - Landscape 16:9
- `landscape_21_9` - Landscape 21:9

## Unterstützte Resolutions
- `1K` - Standard
- `2K` - High Definition
- `4K` - Ultra HD

## Beispiel: Edit
```json
{
  "prompt": "Refer to this logo and create a branded product showcase",
  "image_urls": [
    "https://example.com/logo.png"
  ],
  "image_size": "square_hd",
  "image_resolution": "1K",
  "max_images": 1
}
```

## Beispiel: Text-to-Image
```json
{
  "prompt": "Draw a mathematical equation on a blackboard",
  "image_size": "landscape_16_9",
  "image_resolution": "2K",
  "max_images": 1
}
```

## Features
- Präzise Anweisungsbearbeitung
- Starke Feature-Erhaltung
- Tiefes Intent-Verständnis
- Multi-Image Input/Output (bis zu 10 Eingaben, 6 Ausgaben)
- Ultra-schnelle Generation (~1.8s für 2K)
- Bis zu 4K Auflösung
- Wissensbasierte Generierung
- Komplexes Reasoning

## Anwendungsfälle
- Kreatives Design
- Marketing-Assets
- Filmproduktion
- Social Media Content
- Produktfotografie
- Branding & Identität


offizielle Doku:
# Seedream V4 Text To Image API Documentation

> Generate content using the Seedream V4 Text To Image model

## Overview

This document describes how to use the Seedream V4 Text To Image model for content generation. The process consists of two steps:
1. Create a generation task
2. Query task status and results

## Authentication

All API requests require a Bearer Token in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

Get API Key:
1. Visit [API Key Management Page](https://kie.ai/api-key) to get your API Key
2. Add to request header: `Authorization: Bearer YOUR_API_KEY`

---

## 1. Create Generation Task

### API Information
- **URL**: `POST https://api.kie.ai/api/v1/jobs/createTask`
- **Content-Type**: `application/json`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Model name, format: `bytedance/seedream-v4-text-to-image` |
| input | object | Yes | Input parameters object |
| callBackUrl | string | No | Callback URL for task completion notifications. If provided, the system will send POST requests to this URL when the task completes (success or fail). If not provided, no callback notifications will be sent. Example: `"https://your-domain.com/api/callback"` |

### Model Parameter

The `model` parameter specifies which AI model to use for content generation.

| Property | Value | Description |
|----------|-------|-------------|
| **Format** | `bytedance/seedream-v4-text-to-image` | The exact model identifier for this API |
| **Type** | string | Must be passed as a string value |
| **Required** | Yes | This parameter is mandatory for all requests |

> **Note**: The model parameter must match exactly as shown above. Different models have different capabilities and parameter requirements.

### Callback URL Parameter

The `callBackUrl` parameter allows you to receive automatic notifications when your task completes.

| Property | Value | Description |
|----------|-------|-------------|
| **Purpose** | Task completion notification | Receive real-time updates when your task finishes |
| **Method** | POST request | The system sends POST requests to your callback URL |
| **Timing** | When task completes | Notifications sent for both success and failure states |
| **Content** | Query Task API response | Callback content structure is identical to the Query Task API response |
| **Parameters** | Complete request data | The `param` field contains the complete Create Task request parameters, not just the input section |
| **Optional** | Yes | If not provided, no callback notifications will be sent |

**Important Notes:**
- The callback content structure is identical to the Query Task API response
- The `param` field contains the complete Create Task request parameters, not just the input section  
- If `callBackUrl` is not provided, no callback notifications will be sent

### input Object Parameters

#### prompt
- **Type**: `string`
- **Required**: Yes
- **Description**: The text prompt used to generate the image
- **Max Length**: 5000 characters
- **Default Value**: `"Draw the following system of binary linear equations and the corresponding solution steps on the blackboard: 5x + 2y = 26; 2x -y = 5."`

#### image_size
- **Type**: `string`
- **Required**: No
- **Description**: The size of the generated image.
- **Options**:
  - `square`: Square
  - `square_hd`: Square HD
  - `portrait_4_3`: Portrait 3:4
  - `portrait_3_2`: Portrait 2:3
  - `portrait_16_9`: Portrait 9:16
  - `landscape_4_3`: Landscape 4:3
  - `landscape_3_2`: Landscape 3:2
  - `landscape_16_9`: Landscape 16:9
  - `landscape_21_9`: Landscape 21:9
- **Default Value**: `"square_hd"`

#### image_resolution
- **Type**: `string`
- **Required**: No
- **Description**: Final image resolution is determined by combining image_size (aspect ratio) and image_resolution (pixel scale). For example, choosing 4:3 + 4K gives 4096 × 3072px
- **Options**:
  - `1K`: 1K
  - `2K`: 2K
  - `4K`: 4K
- **Default Value**: `"1K"`

#### max_images
- **Type**: `number`
- **Required**: No
- **Description**: Set this value (1–6) to cap how many images a single generation run can produce in one set—because they’re created in one shot rather than separate requests, you must also state the exact number you want in the prompt so both settings align.
- **Range**: 1 - 6 (step: 1)
- **Default Value**: `1`

#### seed
- **Type**: `number`
- **Required**: No
- **Description**: Random seed to control the stochasticity of image generation

### Request Example

```json
{
  "model": "bytedance/seedream-v4-text-to-image",
  "input": {
    "prompt": "Draw the following system of binary linear equations and the corresponding solution steps on the blackboard: 5x + 2y = 26; 2x -y = 5.",
    "image_size": "square_hd",
    "image_resolution": "1K",
    "max_images": 1,
    "seed": 42
  }
}
```
### Response Example

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0*********************f39b9"
  }
}
```

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| code | integer | Response status code, 200 indicates success |
| msg | string | Response message |
| data.taskId | string | Task ID for querying task status |

---

## 2. Query Task Status

### API Information
- **URL**: `GET https://api.kie.ai/api/v1/jobs/recordInfo`
- **Parameter**: `taskId` (passed via URL parameter)

### Request Example
```
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=281e5b0*********************f39b9
```

### Response Example

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0*********************f39b9",
    "model": "bytedance/seedream-v4-text-to-image",
    "state": "waiting",
    "param": "{\"model\":\"bytedance/seedream-v4-text-to-image\",\"input\":{\"prompt\":\"Draw the following system of binary linear equations and the corresponding solution steps on the blackboard: 5x + 2y = 26; 2x -y = 5.\",\"image_size\":\"square_hd\",\"image_resolution\":\"1K\",\"max_images\":1,\"seed\":42}}",
    "resultJson": "{\"resultUrls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/17574827791652buuj6b7.png\"]}",
    "failCode": null,
    "failMsg": null,
    "costTime": null,
    "completeTime": null,
    "createTime": 1757584164490
  }
}
```

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| code | integer | Response status code, 200 indicates success |
| msg | string | Response message |
| data.taskId | string | Task ID |
| data.model | string | Model name used |
| data.state | string | Task status: `waiting`(waiting),  `success`(success), `fail`(fail) |
| data.param | string | Task parameters (JSON string) |
| data.resultJson | string | Task result (JSON string, available when task is success). Structure depends on outputMediaType: `{resultUrls: []}` for image/media/video, `{resultObject: {}}` for text |
| data.failCode | string | Failure code (available when task fails) |
| data.failMsg | string | Failure message (available when task fails) |
| data.costTime | integer | Task duration in milliseconds (available when task is success) |
| data.completeTime | integer | Completion timestamp (available when task is success) |
| data.createTime | integer | Creation timestamp |

---

## Usage Flow

1. **Create Task**: Call `POST https://api.kie.ai/api/v1/jobs/createTask` to create a generation task
2. **Get Task ID**: Extract `taskId` from the response
3. **Wait for Results**: 
   - If you provided a `callBackUrl`, wait for the callback notification
   - If no `callBackUrl`, poll status by calling `GET https://api.kie.ai/api/v1/jobs/recordInfo`
4. **Get Results**: When `state` is `success`, extract generation results from `resultJson`

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Request successful |
| 400 | Invalid request parameters |
| 401 | Authentication failed, please check API Key |
| 402 | Insufficient account balance |
| 404 | Resource not found |
| 422 | Parameter validation failed |
| 429 | Request rate limit exceeded |
| 500 | Internal server error |

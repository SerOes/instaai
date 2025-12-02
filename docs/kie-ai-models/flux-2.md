# Flux 2 API (Black Forest Labs)

offizielle Doku: https://kie.ai/flux-2

## Übersicht
- **Anbieter**: Black Forest Labs via KIE.ai
- **Typ**: Text-to-Image, Image-to-Image
- **Pricing**: 
  - Pro: 5 credits (~$0.025) für 1K, 7 credits (~$0.035) für 2K
  - Flex: 14 credits (~$0.07) für 1K, 24 credits (~$0.12) für 2K

## Verfügbare Modelle

### 1. Flux 2 Pro Image-to-Image
- **Modell-ID**: `flux-2/pro-image-to-image`
- **Typ**: Image-to-Image (benötigt Eingabebild)

### 2. Flux 2 Pro Text-to-Image  
- **Modell-ID**: `flux-2/pro-text-to-image`
- **Typ**: Text-to-Image

### 3. Flux 2 Flex Image-to-Image
- **Modell-ID**: `flux-2/flex-image-to-image`
- **Typ**: Image-to-Image mit mehr Kontrolle

### 4. Flux 2 Flex Text-to-Image
- **Modell-ID**: `flux-2/flex-text-to-image`
- **Typ**: Text-to-Image mit mehr Kontrolle

## API Endpoints
```
POST https://api.kie.ai/api/v1/flux-2/pro-image-to-image/generate
POST https://api.kie.ai/api/v1/flux-2/pro-text-to-image/generate
POST https://api.kie.ai/api/v1/flux-2/flex-image-to-image/generate
POST https://api.kie.ai/api/v1/flux-2/flex-text-to-image/generate

GET https://api.kie.ai/api/v1/flux-2/{model}/record-info?taskId={taskId}
```

## Request Parameter

### Image-to-Image
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `input_urls` | array | ✅ | Referenzbilder (1-8 Bilder) |
| `prompt` | string | ✅ | Text-Beschreibung (3-5000 Zeichen) |
| `aspect_ratio` | string | ✅ | Seitenverhältnis |
| `resolution` | string | ✅ | Auflösung: 1K, 2K |

### Text-to-Image
| Parameter | Typ | Erforderlich | Beschreibung |
|-----------|-----|--------------|--------------|
| `prompt` | string | ✅ | Text-Beschreibung (3-5000 Zeichen) |
| `aspect_ratio` | string | ✅ | Seitenverhältnis |
| `resolution` | string | ✅ | Auflösung: 1K, 2K |

## Unterstützte Aspect Ratios
- `1:1` - Square
- `4:3` - Landscape
- `3:4` - Portrait
- `16:9` - Widescreen
- `9:16` - Vertical
- `3:2` - Classic
- `2:3` - Classic Portrait
- `auto` - Automatisch (basierend auf Eingabebild)

## Unterstützte Resolutions
- `1K` - Standard
- `2K` - High Definition

## Beispiel: Image-to-Image
```json
{
  "input_urls": [
    "https://example.com/image1.png",
    "https://example.com/image2.png"
  ],
  "prompt": "Replace the background with a sunset scene",
  "aspect_ratio": "1:1",
  "resolution": "1K"
}
```

## Beispiel: Text-to-Image
```json
{
  "prompt": "A futuristic cityscape at night with neon lights",
  "aspect_ratio": "16:9",
  "resolution": "2K"
}
```

## Features
- Multi-Referenz Konsistenz (bis zu 8 Bilder)
- Hohe Bildqualität
- Verbessertes Text-Rendering
- Starke Prompt-Befolgung
- 4MP Auflösung
- Flexible Aspect Ratios

## Flex vs Pro
| Feature | Pro | Flex |
|---------|-----|------|
| Geschwindigkeit | Schnell | Langsamer (qualitätsfokussiert) |
| Kontrolle | Standard | Steps & Guidance anpassbar |
| Beste für | Produktion | Maximale Qualität |


offizielle Doku:
# Pro Image To Image API Documentation

> Generate content using the Pro Image To Image model

## Overview

This document describes how to use the Pro Image To Image model for content generation. The process consists of two steps:
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
| model | string | Yes | Model name, format: `flux-2/pro-image-to-image` |
| input | object | Yes | Input parameters object |
| callBackUrl | string | No | Callback URL for task completion notifications. If provided, the system will send POST requests to this URL when the task completes (success or fail). If not provided, no callback notifications will be sent. Example: `"https://your-domain.com/api/callback"` |

### Model Parameter

The `model` parameter specifies which AI model to use for content generation.

| Property | Value | Description |
|----------|-------|-------------|
| **Format** | `flux-2/pro-image-to-image` | The exact model identifier for this API |
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

#### input_urls
- **Type**: `array`
- **Required**: Yes
- **Description**: Input reference images (1-8 images).
- **Max File Size**: 10MB
- **Accepted File Types**: image/jpeg, image/png, image/webp
- **Multiple Files**: Yes
- **Default Value**: `["https://static.aiquickdraw.com/tools/example/1764235041265_kjJ2sTMR.png","https://static.aiquickdraw.com/tools/example/1764235045490_9SjAUr4Z.png"]`

#### prompt
- **Type**: `string`
- **Required**: Yes
- **Description**:  Must be between 3 and 5000 characters.
- **Max Length**: 5000 characters
- **Default Value**: `"The jar in image 1 is filled with capsules exactly same as image 2 with the exact logo"`

#### aspect_ratio
- **Type**: `string`
- **Required**: Yes
- **Description**: Aspect ratio for the generated image. Select 'auto' to match the first input image ratio (requires input image).
- **Options**:
  - `1:1`: 1:1 (Square)
  - `4:3`: 4:3 (Landscape)
  - `3:4`: 3:4 (Portrait)
  - `16:9`: 16:9 (Widescreen)
  - `9:16`: 9:16 (Vertical)
  - `3:2`: 3:2 (Classic)
  - `2:3`: 2:3 (Classic Portrait)
  - `auto`: Auto (Based on first input image) (Automatically select ratio based on the first input image. Requires at least one input image.)
- **Default Value**: `"1:1"`

#### resolution
- **Type**: `string`
- **Required**: Yes
- **Description**: Output image resolution.
- **Options**:
  - `1K`: 1K
  - `2K`: 2K
- **Default Value**: `"1K"`

### Request Example

```json
{
  "model": "flux-2/pro-image-to-image",
  "input": {
    "input_urls": ["https://static.aiquickdraw.com/tools/example/1764235041265_kjJ2sTMR.png","https://static.aiquickdraw.com/tools/example/1764235045490_9SjAUr4Z.png"],
    "prompt": "The jar in image 1 is filled with capsules exactly same as image 2 with the exact logo",
    "aspect_ratio": "1:1",
    "resolution": "1K"
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
    "model": "flux-2/pro-image-to-image",
    "state": "waiting",
    "param": "{\"model\":\"flux-2/pro-image-to-image\",\"input\":{\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1764235041265_kjJ2sTMR.png\",\"https://static.aiquickdraw.com/tools/example/1764235045490_9SjAUr4Z.png\"],\"prompt\":\"The jar in image 1 is filled with capsules exactly same as image 2 with the exact logo\",\"aspect_ratio\":\"1:1\",\"resolution\":\"1K\"}}",
    "resultJson": "{\"resultUrls\":[\"https://static.aiquickdraw.com/tools/example/1764235088513_4zZQUda1.png\"]}",
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


# Pro Image To Image API Documentation

> Generate content using the Pro Image To Image model

## Overview

This document describes how to use the Pro Image To Image model for content generation. The process consists of two steps:
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
| model | string | Yes | Model name, format: `flux-2/pro-image-to-image` |
| input | object | Yes | Input parameters object |
| callBackUrl | string | No | Callback URL for task completion notifications. If provided, the system will send POST requests to this URL when the task completes (success or fail). If not provided, no callback notifications will be sent. Example: `"https://your-domain.com/api/callback"` |

### Model Parameter

The `model` parameter specifies which AI model to use for content generation.

| Property | Value | Description |
|----------|-------|-------------|
| **Format** | `flux-2/pro-image-to-image` | The exact model identifier for this API |
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

#### input_urls
- **Type**: `array`
- **Required**: Yes
- **Description**: Input reference images (1-8 images).
- **Max File Size**: 10MB
- **Accepted File Types**: image/jpeg, image/png, image/webp
- **Multiple Files**: Yes
- **Default Value**: `["https://static.aiquickdraw.com/tools/example/1764235041265_kjJ2sTMR.png","https://static.aiquickdraw.com/tools/example/1764235045490_9SjAUr4Z.png"]`

#### prompt
- **Type**: `string`
- **Required**: Yes
- **Description**:  Must be between 3 and 5000 characters.
- **Max Length**: 5000 characters
- **Default Value**: `"The jar in image 1 is filled with capsules exactly same as image 2 with the exact logo"`

#### aspect_ratio
- **Type**: `string`
- **Required**: Yes
- **Description**: Aspect ratio for the generated image. Select 'auto' to match the first input image ratio (requires input image).
- **Options**:
  - `1:1`: 1:1 (Square)
  - `4:3`: 4:3 (Landscape)
  - `3:4`: 3:4 (Portrait)
  - `16:9`: 16:9 (Widescreen)
  - `9:16`: 9:16 (Vertical)
  - `3:2`: 3:2 (Classic)
  - `2:3`: 2:3 (Classic Portrait)
  - `auto`: Auto (Based on first input image) (Automatically select ratio based on the first input image. Requires at least one input image.)
- **Default Value**: `"1:1"`

#### resolution
- **Type**: `string`
- **Required**: Yes
- **Description**: Output image resolution.
- **Options**:
  - `1K`: 1K
  - `2K`: 2K
- **Default Value**: `"1K"`

### Request Example

```json
{
  "model": "flux-2/pro-image-to-image",
  "input": {
    "input_urls": ["https://static.aiquickdraw.com/tools/example/1764235041265_kjJ2sTMR.png","https://static.aiquickdraw.com/tools/example/1764235045490_9SjAUr4Z.png"],
    "prompt": "The jar in image 1 is filled with capsules exactly same as image 2 with the exact logo",
    "aspect_ratio": "1:1",
    "resolution": "1K"
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
    "model": "flux-2/pro-image-to-image",
    "state": "waiting",
    "param": "{\"model\":\"flux-2/pro-image-to-image\",\"input\":{\"input_urls\":[\"https://static.aiquickdraw.com/tools/example/1764235041265_kjJ2sTMR.png\",\"https://static.aiquickdraw.com/tools/example/1764235045490_9SjAUr4Z.png\"],\"prompt\":\"The jar in image 1 is filled with capsules exactly same as image 2 with the exact logo\",\"aspect_ratio\":\"1:1\",\"resolution\":\"1K\"}}",
    "resultJson": "{\"resultUrls\":[\"https://static.aiquickdraw.com/tools/example/1764235088513_4zZQUda1.png\"]}",
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

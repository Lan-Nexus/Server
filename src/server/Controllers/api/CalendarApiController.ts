import { Request, Response } from 'express';

export default class CalendarApiController {
    /**
     * Fetch calendar data from a URL
     * POST /api/calendar/fetch
     * Body: { url: string }
     */
    async fetchFromUrl(req: Request, res: Response) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    error: 'URL is required',
                    message: 'Please provide a valid calendar URL'
                });
            }

            // Basic URL validation
            let validUrl: URL;
            try {
                validUrl = new URL(url);
            } catch (error) {
                return res.status(400).json({
                    error: 'Invalid URL',
                    message: 'Please provide a valid URL format'
                });
            }

            // Only allow HTTP and HTTPS protocols
            if (!['http:', 'https:'].includes(validUrl.protocol)) {
                return res.status(400).json({
                    error: 'Invalid protocol',
                    message: 'Only HTTP and HTTPS URLs are allowed'
                });
            }

            console.log(`Fetching calendar from URL: ${url}`);

            // Fetch the calendar data with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/calendar, text/plain, application/octet-stream, */*',
                    'User-Agent': 'Calendar-Importer/1.0',
                },
                signal: controller.signal,
                redirect: 'follow', // Follow redirects
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`Failed to fetch calendar: ${response.status} ${response.statusText}`);
                return res.status(response.status).json({
                    error: 'Failed to fetch calendar',
                    message: `Server responded with ${response.status}: ${response.statusText}`,
                    details: {
                        status: response.status,
                        statusText: response.statusText,
                        url: url
                    }
                });
            }

            const contentType = response.headers.get('content-type') || '';
            console.log(`Content-Type: ${contentType}`);

            // Get the calendar content
            const calendarData = await response.text();

            if (!calendarData || calendarData.trim().length === 0) {
                return res.status(400).json({
                    error: 'Empty response',
                    message: 'The URL returned empty content'
                });
            }

            // Basic validation to check if it looks like calendar data
            const isCalendarData = calendarData.includes('BEGIN:VCALENDAR') ||
                calendarData.includes('BEGIN:VEVENT') ||
                contentType.includes('text/calendar');

            if (!isCalendarData) {
                return res.status(400).json({
                    error: 'Invalid calendar format',
                    message: 'The URL does not appear to contain valid calendar data (missing VCALENDAR or VEVENT)',
                    details: {
                        contentType: contentType,
                        contentPreview: calendarData.substring(0, 200)
                    }
                });
            }

            console.log(`Successfully fetched calendar data (${calendarData.length} characters)`);

            // Return the calendar data
            return res.json({
                success: true,
                data: calendarData,
                metadata: {
                    url: url,
                    contentType: contentType,
                    size: calendarData.length,
                    fetchedAt: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('Calendar fetch error:', error);

            // Handle specific error types
            if (error.name === 'AbortError') {
                return res.status(408).json({
                    error: 'Request timeout',
                    message: 'The request timed out. The server may be slow or unreachable.'
                });
            }

            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                return res.status(400).json({
                    error: 'Connection failed',
                    message: 'Unable to connect to the provided URL. Please check if the URL is accessible.',
                    details: {
                        code: error.code,
                        hostname: error.hostname
                    }
                });
            }

            // Generic error response
            return res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred while fetching the calendar',
                details: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    stack: error.stack
                } : undefined
            });
        }
    }
}
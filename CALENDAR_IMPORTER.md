# Calendar Importer

The Calendar Importer allows you to import events from external calendar applications into your gaming event system.

## Supported Formats

- `.ics` (iCalendar) - Standard calendar format
- `.ical` - Apple Calendar format  
- `.ifb` - Free/Busy time format
- `.icalendar` - Extended calendar format

## Import Methods

### 1. File Upload
- Click "File Upload" tab
- Select a calendar file from your computer
- Supported file extensions: .ics, .ical, .ifb, .icalendar

### 2. Paste Content
- Click "Paste Content" tab
- Copy the raw content of your calendar file
- Paste it into the text area
- Click "Parse Calendar"

### 3. URL Import
- Click "URL Import" tab
- Enter the URL of a publicly accessible calendar file
- Click "Fetch Calendar"

## Event Processing

### Game Assignment
After parsing calendar events, you need to assign them to games in your system:

1. **Default Game Assignment**: Select a game from the dropdown and click "Apply to All" to assign it to all unassigned events
2. **Individual Assignment**: Use the dropdown next to each event to assign it to a specific game
3. **Remove Events**: Click the "Remove" button to exclude events you don't want to import

### Event Fields Mapping

The importer maps calendar fields as follows:

| Calendar Field | Event Field | Notes |
|---------------|-------------|-------|
| SUMMARY | Title | Used for event description if no DESCRIPTION |
| DTSTART | Start Time | Converted to local timezone |
| DTEND | End Time | Converted to local timezone |
| DESCRIPTION | Description | Falls back to title if empty |

### Import Process

1. Review all parsed events
2. Assign games to events (required)
3. Remove any unwanted events
4. Click "Import X Events" to add them to your system

## Supported Calendar Applications

This importer works with calendar files exported from:

- **Google Calendar** (Export as .ics)
- **Outlook/Exchange** (Export as .ics)
- **Apple Calendar** (Export as .ics)
- **Mozilla Thunderbird** (Export as .ics)
- **Any RFC 5545 compliant calendar application**

## Tips

- **Large Calendars**: The importer handles large calendar files, but you can remove unwanted events before importing
- **Recurring Events**: Each occurrence of recurring events will be imported as a separate event
- **Time Zones**: Times are converted to your local timezone automatically
- **Game Selection**: Make sure to have games created in your system before importing events
- **Error Handling**: If some events fail to import, the successful ones will still be added

## Troubleshooting

### "No events found"
- Check that your calendar file contains VEVENT blocks
- Ensure the file is a valid .ics format
- Try exporting the calendar again from your source application

### "Failed to parse calendar"
- The calendar file may be corrupted or in an unsupported format
- Try copying the content and using the "Paste Content" method
- Check that all required fields (SUMMARY, DTSTART, DTEND) are present

### "Game assignment required"
- All events must be assigned to a game before importing
- Create games in your system first, then return to the importer
- Use the "Apply to All" feature for bulk assignment

## Example Calendar File

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp//CalDAV Client//EN
BEGIN:VEVENT
UID:example-event-1@example.com
DTSTART:20241102T190000Z
DTEND:20241102T220000Z
SUMMARY:Gaming Tournament
DESCRIPTION:Weekly gaming tournament event
END:VEVENT
END:VCALENDAR
```
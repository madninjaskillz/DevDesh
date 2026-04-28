// Outlook calendar integration — reads a meetings.json file written by a
// PowerShell script the user runs locally. Uses the File System Access API to
// hold a persistent handle to the file so the dashboard can re-read it across
// sessions without re-prompting the user.

export interface OutlookMeeting {
  id: string;
  subject: string;
  start: string;
  end: string;
  location?: string;
  organizer?: string;
  isAllDay?: boolean;
  url?: string;
}

export interface MeetingsFile {
  generatedAt: string;
  meetings: OutlookMeeting[];
}

// IndexedDB handle storage — FileSystemFileHandle objects are structured-clonable
// and persist across browser sessions, but localStorage can't hold them.
const DB_NAME = 'devdesh-outlook';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'meetings-file';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadFileHandle(): Promise<FileSystemFileHandle | null> {
  const db = await openDB();
  const handle = await new Promise<FileSystemFileHandle | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
    req.onsuccess = () => resolve((req.result as FileSystemFileHandle | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return handle;
}

export async function clearFileHandle(): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

export async function pickMeetingsFile(): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('Your browser does not support the File System Access API. Use Edge or Chrome.');
  }
  const win = window as unknown as {
    showOpenFilePicker: (opts?: {
      types?: { description: string; accept: Record<string, string[]> }[];
      multiple?: boolean;
    }) => Promise<FileSystemFileHandle[]>;
  };
  try {
    const [handle] = await win.showOpenFilePicker({
      types: [{ description: 'Meetings JSON', accept: { 'application/json': ['.json'] } }],
      multiple: false,
    });
    return handle ?? null;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
}

export async function ensureReadPermission(handle: FileSystemFileHandle): Promise<boolean> {
  // Cast — the permission methods are not in lib.dom yet for all TS versions.
  const h = handle as FileSystemFileHandle & {
    queryPermission: (opts: { mode: 'read' }) => Promise<PermissionState>;
    requestPermission: (opts: { mode: 'read' }) => Promise<PermissionState>;
  };
  if ((await h.queryPermission({ mode: 'read' })) === 'granted') return true;
  return (await h.requestPermission({ mode: 'read' })) === 'granted';
}

export async function readMeetingsFile(handle: FileSystemFileHandle): Promise<MeetingsFile> {
  const file = await handle.getFile();
  const text = await file.text();
  const data = JSON.parse(text) as Partial<MeetingsFile>;
  if (!data || !Array.isArray(data.meetings)) {
    throw new Error('meetings.json is malformed — expected { generatedAt, meetings: [...] }');
  }
  return {
    generatedAt: data.generatedAt ?? new Date(file.lastModified).toISOString(),
    meetings: data.meetings as OutlookMeeting[],
  };
}

// PowerShell script — run by the user to dump today/tomorrow's calendar to JSON.
// Uses Outlook COM automation; requires desktop Outlook and a signed-in profile.
export const OUTLOOK_PS1 = `# DevDesh — Outlook calendar export
# Writes the next 36 hours of meetings to meetings.json next to this script.
# Requires desktop Outlook to be installed and signed in.

$ErrorActionPreference = 'Stop'

try {
    $outlook = New-Object -ComObject Outlook.Application
} catch {
    Write-Error "Could not connect to Outlook. Make sure Outlook desktop is installed and you have signed in at least once."
    exit 1
}

$ns = $outlook.GetNamespace('MAPI')
$cal = $ns.GetDefaultFolder(9)  # olFolderCalendar
$items = $cal.Items
$items.IncludeRecurrences = $true
$items.Sort('[Start]')

$start = (Get-Date).Date
$end = $start.AddDays(2)
$fmt = 'MM/dd/yyyy HH:mm'
$filter = "[Start] <= '" + $end.ToString($fmt) + "' AND [End] >= '" + $start.ToString($fmt) + "'"
$filtered = $items.Restrict($filter)

$result = @()
foreach ($item in $filtered) {
    try {
        $bodySnippet = ''
        if ($item.Body) {
            $bodySnippet = $item.Body.Substring(0, [Math]::Min(500, $item.Body.Length))
        }
        $result += [PSCustomObject]@{
            id        = $item.EntryID
            subject   = $item.Subject
            start     = $item.Start.ToString('o')
            end       = $item.End.ToString('o')
            location  = $item.Location
            organizer = $item.Organizer
            isAllDay  = [bool]$item.AllDayEvent
            body      = $bodySnippet
        }
    } catch {
        # Skip items we can't read (corrupted recurrences etc.)
    }
}

$payload = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString('o')
    meetings    = $result
}

$outDir = $PSScriptRoot
if (-not $outDir) { $outDir = (Get-Location).Path }
$outFile = Join-Path $outDir 'meetings.json'
$payload | ConvertTo-Json -Depth 4 | Set-Content -Path $outFile -Encoding UTF8

Write-Host "Wrote $($result.Count) meeting(s) to $outFile"
`;

export function downloadScript(): void {
  const blob = new Blob([OUTLOOK_PS1], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'devdesh-outlook.ps1';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

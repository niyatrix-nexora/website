from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from concurrent.futures import ThreadPoolExecutor
import urllib.request
import json
import logging

logger = logging.getLogger(__name__)
sheet_executor = ThreadPoolExecutor(max_workers=getattr(settings, "SHEET_WORKERS", 2))

from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def home(request):
    return render(request, "demo2.html")

@ensure_csrf_cookie
def blog(request):
    return render(request, "blog.html")

@ensure_csrf_cookie
def careers(request):
    return render(request, "careers.html")

SHEET_URL = getattr(settings, 'SHEET_URL', None)
JOBS_SHEET_URL = getattr(settings, 'JOBS_SHEET_URL', None)


def post_to_sheet(payload, url):
    if not url:
        logger.error("Sheet URL is not configured; dropping form submission.")
        return

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            if result.get('status') != 'ok':
                logger.error("Sheet returned an error for payload type %s", payload.get('service', 'contact'))
    except Exception:
        logger.exception("Unable to submit form payload to Google Apps Script.")


def queue_sheet_submission(payload, url):
    sheet_executor.submit(post_to_sheet, payload, url)

def contact(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)

    name    = request.POST.get('from_name', '').strip()
    email   = request.POST.get('reply_to', '').strip()
    service = request.POST.get('service', '').strip()
    message = request.POST.get('message', '').strip()

    if not all([name, email, message]):
        return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

    payload = {
        'name':    name,
        'email':   email,
        'service': service,
        'message': message,
    }
    queue_sheet_submission(payload, SHEET_URL)
    return JsonResponse({'status': 'ok', 'queued': True}, status=202)

def apply_job(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)

    name         = request.POST.get('from_name', '').strip()
    email        = request.POST.get('reply_to', '').strip()
    portfolio    = request.POST.get('portfolio', '').strip()
    resume_url   = request.POST.get('resume_url', '').strip()
    cover_letter = request.POST.get('cover_letter', '').strip()
    job_title    = request.POST.get('job_title', '').strip()

    if not all([name, email, job_title]):
        return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

    payload = {
        'fullName': name,
        'email': email,
        'portfolio': portfolio,
        'resumeUrl': resume_url,
        'coverLetter': cover_letter,
    }
    queue_sheet_submission(payload, JOBS_SHEET_URL)
    return JsonResponse({'status': 'ok', 'queued': True}, status=202)

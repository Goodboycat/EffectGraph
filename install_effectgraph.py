#!/usr/bin/env python3
"""Self-extracting installer for EffectGraph (small payload demo).
Run: python install_effectgraph.py --dir target_dir
"""
import os, sys, base64, zipfile, io, argparse, shutil
PAYLOAD = """UEsDBBQAAAAIAGy3Vlu6e82jJQAAAC0AAAAJAAAAUkVBRE1FLm1kU1ZwTUtLTS5xL0osyODiCi5JLCpJLVIoSi3IV0jLL0KW1eMCAFBLAwQUAAAACABst1Zb83n+8y4AAAAxAAAADAAAAHBhY2thZ2UuanNvbqvmUlBQykvMTVWyUlBKTUtLTS5JL0osyFDSAUmUpRYVZ+bngeQM9Iz0DJS4agFQSwMEFAAAAAgAbLdWW63u55A5AAAARgAAAAwAAABzcmMvaW5kZXgudHNLrSjILypR0FJIK8rPVVDX0y+pLEgtVrdWSIVIVCskF6UmlqS6pqWlJpco1MLVJecXpeqngkXVrQFQSwMEFAAAAAgAbLdWW2nrMk53AAAAygAAAAwAAABzcmMvdHlwZXMudHN1jcEKwjAQRH8lH+AXJAdP3kWP4mG7TGBhkw3pWiql/y4iVRQ8Dcy8mcHcrHuQ6uiZGOGQM9jPDbygiJ/IsY/1Vgb0VGg+Undhxfg2VTJcyodaA35Ht9bSbBQXq/Hygndfck0T1Fj8/i9/nm0/pDIhDmYKqml9AFBLAwQUAAAACABst1Zb1kWUm18AAABrAAAADwAAAGRvY3MvaW5kZXguaHRtbCXMzQ5FMBBA4VepWFgSS6q7G89R86OJYZqqRd+eS05ylp+tUCGXSCbkXZz9vigWc+YiNDWLh21Neh041F3/5EdQ0TTUzNy4HzNBnpOPwSDtaqJ4oKCClGz7h5xtX/UGUEsDBBQAAAAIAGy3Vlv9jd9yGAAAABYAAAAeAAAALmdpdGh1Yi93b3JrZmxvd3MvZ2gtcGFnZXMueW1sy0vMTbVScEktyMmv5M3Ps1IoKC3O4AIAUEsBAhQDFAAAAAgAbLdWW7p7zaMlAAAALQAAAAkAAAAAAAAAAAAAAKSBAAAAAFJFQURNRS5tZFBLAQIUAxQAAAAIAGy3Vlvzef7zLgAAADEAAAAMAAAAAAAAAAAAAACkgUwAAABwYWNrYWdlLmpzb25QSwECFAMUAAAACABst1Zbre7nkDkAAABGAAAADAAAAAAAAAAAAAAApIGkAAAAc3JjL2luZGV4LnRzUEsBAhQDFAAAAAgAbLdWW2nrMk53AAAAygAAAAwAAAAAAAAAAAAAAKSBBwEAAHNyYy90eXBlcy50c1BLAQIUAxQAAAAIAGy3VlvWRZSbXwAAAGsAAAAPAAAAAAAAAAAAAACkgagBAABkb2NzL2luZGV4Lmh0bWxQSwECFAMUAAAACABst1Zb/Y3fchgAAAAWAAAAHgAAAAAAAAAAAAAApIE0AgAALmdpdGh1Yi93b3JrZmxvd3MvZ2gtcGFnZXMueW1sUEsFBgAAAAAGAAYAbgEAAIgCAAAAAA=="""
def main():
    p = argparse.ArgumentParser()
    p.add_argument('--dir','-d',default='effectgraph',help='Target directory (default ./effectgraph)')
    p.add_argument('--force','-f',action='store_true',help='Overwrite existing target')
    args = p.parse_args()
    target = os.path.abspath(args.dir)
    if os.path.exists(target) and not args.force:
        print('Target exists:', target)
        print('Use --force to overwrite.')
        sys.exit(1)
    if os.path.exists(target) and args.force:
        shutil.rmtree(target)
    os.makedirs(target, exist_ok=True)
    print('Decoding payload...')
    data = base64.b64decode(PAYLOAD)
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        z.extractall(target)
    print('Done. Files extracted to', target)
    print('Next: cd', target, '&& npm install && npm run dev (if desired)')
if __name__ == '__main__':
    main()

from copy import COPY_STRUCTURE
from util import *

import os
import shutil

def walk_copy_files(src, dst, applies=[]):
	print src
	for (dirpath, dirnames, filenames) in os.walk(src):
		# Copy directories
		for dn in dirnames:
			nsx = os.path.join(src,dn)
			ndx = os.path.join(dst,dn)
			try:
				os.mkdir(ndx)
			except:
				pass
			walk_copy_files(nsx, ndx, applies)
		for fn in filenames:
			src_fn = os.path.join(src,fn)
			for app in applies:
				fn = app(fn)
			dst_fn = os.path.join(dst,fn)
			try:
				shutil.copy2(src_fn,dst_fn)
			except:
				pass

def walk_copy_structure(struct, src_dir, dst_dir, applies=[]):
	for k in struct:
		applies_here = list(applies)
		app = None
		entry = struct[k]
		nsx = os.path.join(src_dir,k)
		ndx = os.path.join(dst_dir,k)
		try:
			os.mkdir(ndx)
		except:
			pass
		if type(entry) is Apply:
			applies_here.append(entry.func)
			entry = entry.sub
		if type(entry) is list:
			entry = {k : True for k in entry}
			print entry
		if type(entry) is dict:
			walk_copy_structure(
				entry,
				nsx,
				ndx,
				applies_here
			)
		elif entry is True:
			# We want to copy this directory
			walk_copy_files(
				nsx,
				ndx,
				applies_here
			)

def main(src_dir, dst_dir):
	assert 'output' in dst_dir
	if os.path.exists(dst_dir):
		shutil.rmtree(dst_dir)
	os.mkdir(dst_dir)
	walk_copy_structure(
		COPY_STRUCTURE,
		src_dir,
		dst_dir
	)
	print "GOTTA GO FAST"

if __name__ == "__main__":
	main('/Users/ianreynolds/khan/webapp/','./output')
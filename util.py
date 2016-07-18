class Apply(object):
	def __init__(self,func,sub):
		self.func = func
		self.sub = sub

CRUFT = '0123456789abcdef'
def remove_hex_cruft(fn):
	name, ext = fn.split('.')
	pieces = name.split('-')
	if not len(set(pieces[-1]) - set(CRUFT)):
		name = '-'.join(pieces[:-1])
	return '.'.join([name,ext])

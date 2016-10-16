
from clarifai.rest import ClarifaiApp
import os
import json

CLIENT_ID = os.environ['CLARIFAI_CLIENT_ID']
CLIENT_SECRET = os.environ['CLARIFAI_CLIENT_SECRET']
DATA_DIR = 'data'
CURRENT_MODEL = 'clothes-v2'
TRAIN = False
FIRST_TIME = False

def listdir_nohidden(path):
	ret = []
	for f in os.listdir(path):
		if not f.startswith('.'):
			ret.append(f)
	return ret

def parse_dat(sub_classes):
	ret = []
	for i in sub_classes:
		ret.append(i.replace('.dat',''))
	return ret

def get_all_concepts(classes):
	ret = []
	for i in classes:
		directory = DATA_DIR + '/' + i
		ret.append(i)
		sub_classes = parse_dat(listdir_nohidden(directory))
		for j in sub_classes:
			ret.append(j)
	return ret

def get_non_concepts(classes, i_r, j_r):
	ret = get_all_concepts(classes)
	#print ret, i_r, j_r
	ret.remove(i_r)
	ret.remove(j_r)
	return ret

app = ClarifaiApp(CLIENT_ID, CLIENT_SECRET)

if TRAIN and not FIRST_TIME:
	raw_input('About to delete and re-train model! Press Enter to continue')

	print 'deleting old model'	
	app.models.delete(CURRENT_MODEL)


classes = listdir_nohidden('data')

print 'parsing data'

if TRAIN:
	for i in classes:
		
		print 'training', i

		directory = DATA_DIR + '/' + i
		sub_classes = parse_dat(listdir_nohidden(directory))

		for j in sub_classes:

			print '\t', j

			sub_directory = directory + '/' + j + '.dat'
			sub_file = open(sub_directory, 'r')
			dat = sub_file.read().splitlines()
			for url in dat:
				concepts = [i,j]
				not_conceps = get_non_concepts(classes, i,j)
				try:
					app.inputs.create_image_from_url(url=url, concepts=concepts, not_concepts=not_conceps)
				except:
					print 'skipping url', url


if TRAIN:
	print 'creating model'
	model = app.models.create(model_id=CURRENT_MODEL, concepts = get_all_concepts(classes))
	print 'training model'
	model = model.train()
else:
	model = app.models.get(CURRENT_MODEL)
	model = model.train()

print 'predicting'
test_url = 'https://anf.scene7.com/is/image/anf/hol_128703_05_prod1?$product-hol-v1$&wid=800&hei=1000'
print json.dumps(model.predict_by_url(url=test_url)["outputs"][0]["data"]["concepts"], indent=4, separators=(',', ': '))





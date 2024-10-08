DKI.templates.feedbackPopup = Handlebars.compile('<div class="modal feedbackContainer hidden" role="dialog">' +
			'<div class="modal-dialog feedbackWrapper" style="{{style}}">' + 
				'<div class="modal-content">' + 
					'<div class="modal-header">' + 
						'<button type="button" class="close feedbackClose" tabindex="0">' +
							'<span aria-hidden="true">&times;</span>' +
						'</button>' +
						'<h4 class="modal-title">{{header}}</h4>' + 
					'</div>' +
					'<div class="modal-body">' +
						'{{{content}}}' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>')